import express from 'express';
import { logger } from '../utils/logger.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Server statistics endpoint (admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), asyncHandler(async (req, res) => {
  const stats = {
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000,
      timestamp: new Date().toISOString()
    }
  };

  logger.info('Server stats requested', {
    requestId: req.id,
    userId: req.user.id,
    ip: req.ip
  });

  res.status(200).json(stats);
}));

// Log files endpoint (admin only)
router.get('/logs', authenticateToken, requireRole(['admin']), asyncHandler(async (req, res) => {
  const logsDir = path.join(process.cwd(), 'logs');
  const logFiles = [];

  try {
    if (fs.existsSync(logsDir)) {
      const files = fs.readdirSync(logsDir);
      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(logsDir, file);
          const stats = fs.statSync(filePath);
          logFiles.push({
            name: file,
            size: stats.size,
            modified: stats.mtime,
            path: filePath
          });
        }
      }
    }

    logger.info('Log files list requested', {
      requestId: req.id,
      userId: req.user.id,
      fileCount: logFiles.length
    });

    res.status(200).json({ logFiles });
  } catch (error) {
    logger.error('Failed to read log files', {
      requestId: req.id,
      userId: req.user.id,
      error: error.message
    });
    throw error;
  }
}));

// View specific log file (admin only)
router.get('/logs/:filename', authenticateToken, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const { lines = 100, level } = req.query;
  
  const logsDir = path.join(process.cwd(), 'logs');
  const filePath = path.join(logsDir, filename);

  // Security check - prevent directory traversal
  if (!filename.endsWith('.log') || filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({
      error: {
        message: 'Invalid log file name',
        statusCode: 400
      }
    });
  }

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: {
          message: 'Log file not found',
          statusCode: 404
        }
      });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    let logLines = content.split('\n').filter(line => line.trim());

    // Filter by log level if specified
    if (level) {
      logLines = logLines.filter(line => {
        try {
          const logEntry = JSON.parse(line);
          return logEntry.level === level.toUpperCase();
        } catch {
          return true;
        }
      });
    }

    // Get last N lines
    const lastLines = logLines.slice(-parseInt(lines));

    logger.info('Log file viewed', {
      requestId: req.id,
      userId: req.user.id,
      filename,
      lines: lastLines.length,
      level
    });

    res.status(200).json({
      filename,
      totalLines: logLines.length,
      returnedLines: lastLines.length,
      level,
      logs: lastLines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { raw: line };
        }
      })
    });
  } catch (error) {
    logger.error('Failed to read log file', {
      requestId: req.id,
      userId: req.user.id,
      filename,
      error: error.message
    });
    throw error;
  }
}));

// Clear log files (admin only)
router.delete('/logs/:filename', authenticateToken, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const logsDir = path.join(process.cwd(), 'logs');
  const filePath = path.join(logsDir, filename);

  // Security check
  if (!filename.endsWith('.log') || filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({
      error: {
        message: 'Invalid log file name',
        statusCode: 400
      }
    });
  }

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: {
          message: 'Log file not found',
          statusCode: 404
        }
      });
    }

    fs.unlinkSync(filePath);

    logger.info('Log file deleted', {
      requestId: req.id,
      userId: req.user.id,
      filename
    });

    res.status(200).json({
      message: 'Log file deleted successfully',
      filename
    });
  } catch (error) {
    logger.error('Failed to delete log file', {
      requestId: req.id,
      userId: req.user.id,
      filename,
      error: error.message
    });
    throw error;
  }
}));

// System health check with detailed metrics
router.get('/health/detailed', asyncHandler(async (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      ...process.memoryUsage(),
      external: process.memoryUsage().external,
      heapTotal: process.memoryUsage().heapTotal,
      heapUsed: process.memoryUsage().heapUsed,
      rss: process.memoryUsage().rss
    },
    cpu: process.cpuUsage(),
    environment: process.env.NODE_ENV || 'development',
    version: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid
  };

  // Check if memory usage is high
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  if (memoryUsagePercent > 80) {
    healthData.status = 'WARNING';
    healthData.memory.warning = 'High memory usage detected';
  }

  logger.info('Detailed health check requested', {
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100
  });

  res.status(200).json(healthData);
}));

export default router;

