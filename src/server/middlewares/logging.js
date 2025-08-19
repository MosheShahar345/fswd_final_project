import { logger } from '../utils/logger.js';

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log the incoming request
  logger.info(`Incoming ${req.method} request to ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    query: Object.keys(req.query).length > 0 ? req.query : null,
    body: req.method !== 'GET' ? req.body : null
  });

  // Override res.end to capture response data
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Log the response
    logger.logRequest(req, res, responseTime);
    
    // Log performance if response time is high
    if (responseTime > 1000) {
      logger.warn(`Slow response detected: ${responseTime}ms for ${req.method} ${req.url}`);
    }
    
    // Call the original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// API response logging middleware
export const apiResponseLogger = (endpoint) => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Override res.json to capture response data
    const originalJson = res.json;
    res.json = function(data) {
      const responseTime = Date.now() - startTime;
      
      // Log API response
      logger.logApiResponse(endpoint, req.method, res.statusCode, responseTime, data);
      
      // Call the original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  logger.error(`Unhandled error in ${req.method} ${req.url}`, {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || 'anonymous',
    body: req.body,
    query: req.query
  });

  next(err);
};

// Security logging middleware
export const securityLogger = (req, res, next) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection attempts
    /eval\s*\(/i, // Code injection attempts
  ];

  const url = req.url.toLowerCase();
  const body = JSON.stringify(req.body || {}).toLowerCase();
  const query = JSON.stringify(req.query || {}).toLowerCase();

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body) || pattern.test(query)) {
      logger.logSecurity('Suspicious request detected', {
        pattern: pattern.toString(),
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        body: req.body,
        query: req.query
      });
      break;
    }
  }

  next();
};

// Rate limiting logging
export const rateLimitLogger = (req, res, next) => {
  const key = req.ip || req.connection.remoteAddress;
  const currentTime = Date.now();
  
  // Simple rate limiting tracking (in production, use a proper rate limiting library)
  if (!req.rateLimitInfo) {
    req.rateLimitInfo = {
      requests: 0,
      windowStart: currentTime
    };
  }

  req.rateLimitInfo.requests++;

  // Log if approaching rate limit
  if (req.rateLimitInfo.requests > 80) {
    logger.warn(`Rate limit approaching for IP: ${key}`, {
      ip: key,
      requests: req.rateLimitInfo.requests,
      windowStart: new Date(req.rateLimitInfo.windowStart).toISOString()
    });
  }

  next();
};

