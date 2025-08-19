import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = process.env.LOG_LEVEL || 'INFO';

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, `server-${new Date().toISOString().split('T')[0]}.log`);
    this.errorFile = path.join(logsDir, `errors-${new Date().toISOString().split('T')[0]}.log`);
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[currentLogLevel];
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(filePath, message) {
    try {
      fs.appendFileSync(filePath, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(level, message, data = null) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, data);
    
    // Console output
    const consoleMessage = `[${new Date().toISOString()}] ${level}: ${message}`;
    if (level === 'ERROR') {
      console.error(consoleMessage, data || '');
    } else if (level === 'WARN') {
      console.warn(consoleMessage, data || '');
    } else {
      console.log(consoleMessage, data || '');
    }

    // File output
    this.writeToFile(this.logFile, formattedMessage);
    
    // Separate error file for errors
    if (level === 'ERROR') {
      this.writeToFile(this.errorFile, formattedMessage);
    }
  }

  error(message, data = null) {
    this.log('ERROR', message, data);
  }

  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  info(message, data = null) {
    this.log('INFO', message, data);
  }

  debug(message, data = null) {
    this.log('DEBUG', message, data);
  }

  // Request logging
  logRequest(req, res, responseTime = null) {
    const requestData = {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : null,
      timestamp: new Date().toISOString(),
      userId: req.user?.id || 'anonymous',
      body: req.method !== 'GET' ? req.body : null,
      query: Object.keys(req.query).length > 0 ? req.query : null
    };

    const level = res.statusCode >= 400 ? 'WARN' : 'INFO';
    const message = `${req.method} ${req.url} - ${res.statusCode}`;
    
    this.log(level, message, requestData);
  }

  // API response logging
  logApiResponse(endpoint, method, statusCode, responseTime, data = null) {
    const responseData = {
      endpoint,
      method,
      statusCode,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      ...(data && { responseData: data })
    };

    const level = statusCode >= 400 ? 'WARN' : 'INFO';
    const message = `API ${method} ${endpoint} - ${statusCode}`;
    
    this.log(level, message, responseData);
  }

  // Database operation logging
  logDbOperation(operation, table, duration, success, error = null) {
    const dbData = {
      operation,
      table,
      duration: `${duration}ms`,
      success,
      timestamp: new Date().toISOString(),
      ...(error && { error: error.message })
    };

    const level = success ? 'INFO' : 'ERROR';
    const message = `DB ${operation} on ${table}`;
    
    this.log(level, message, dbData);
  }

  // Authentication logging
  logAuth(action, userId, success, details = null) {
    const authData = {
      action,
      userId,
      success,
      timestamp: new Date().toISOString(),
      ip: details?.ip,
      userAgent: details?.userAgent,
      ...(details && { details })
    };

    const level = success ? 'INFO' : 'WARN';
    const message = `AUTH ${action} - ${success ? 'SUCCESS' : 'FAILED'}`;
    
    this.log(level, message, authData);
  }

  // Performance logging
  logPerformance(operation, duration, details = null) {
    const perfData = {
      operation,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ...(details && { details })
    };

    const level = duration > 1000 ? 'WARN' : 'INFO';
    const message = `PERF ${operation} - ${duration}ms`;
    
    this.log(level, message, perfData);
  }

  // Security logging
  logSecurity(event, details = null) {
    const securityData = {
      event,
      timestamp: new Date().toISOString(),
      ip: details?.ip,
      userAgent: details?.userAgent,
      userId: details?.userId,
      ...(details && { details })
    };

    this.log('WARN', `SECURITY ${event}`, securityData);
  }
}

export const logger = new Logger();

