const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Authentication middleware to verify JWT tokens
 */
const authenticate = async (req, res, next) => {
  try {
    logger.info('[AUTH] Starting authentication');
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('[AUTH] No valid authorization header');
      return next(new AppError('Access token is required', 401));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    logger.info(`[AUTH] Token extracted: ${token.substring(0, 20)}...`);

    // Verify token
    let decoded;
    try {
      logger.info('[AUTH] Verifying JWT token');
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.info(`[AUTH] Token verified for user ID: ${decoded.id}`);
    } catch (error) {
      logger.warn(`[AUTH] Token verification failed: ${error.message}`);
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Access token has expired', 401));
      } else if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid access token', 401));
      } else {
        return next(new AppError('Token verification failed', 401));
      }
    }

    // Find user
    logger.info(`[AUTH] Finding user by ID: ${decoded.id}`);
    const user = await User.findById(decoded.id);
    logger.info(`[AUTH] User found: ${user ? 'Yes' : 'No'}`);

    if (!user) {
      logger.warn(`[AUTH] User ${decoded.id} not found in database`);
      return next(new AppError('User not found', 401));
    }

    // Check if user is active
    logger.info(`[AUTH] Checking if user is active`);
    if (!user.isActive()) {
      logger.warn(`[AUTH] User ${decoded.id} is not active`);
      return next(new AppError('Account is deactivated', 401));
    }

    // Add user to request object
    req.user = user;
    logger.info(`[AUTH] Authentication successful for user ${decoded.id}`);
    next();

  } catch (error) {
    logger.error('Authentication middleware error:', error);
    next(new AppError('Authentication failed', 500));
  }
};

/**
 * Authorization middleware to check if user has required permissions
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // For now, we'll implement basic role checking
    // This can be expanded when we add role-based permissions
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive()) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token errors for optional auth
      logger.debug('Optional auth token error:', error.message);
    }

    next();

  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next(); // Continue without authentication
  }
};

/**
 * Middleware to check if user's email is verified
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!req.user.isVerified()) {
    return next(new AppError('Email verification required', 403));
  }

  next();
};

/**
 * Rate limiting middleware for authentication endpoints
 */
const authRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true,
  // Custom key generator to include user agent
  keyGenerator: (req) => {
    return `${req.ip}-${req.get('User-Agent')}`;
  }
});

/**
 * Middleware to extract user from token without requiring authentication
 * Useful for endpoints that behave differently for authenticated users
 */
const extractUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive()) {
          req.user = user;
        }
      } catch (error) {
        // Silently ignore token errors
      }
    }

    next();
  } catch (error) {
    logger.error('Extract user middleware error:', error);
    next(); // Continue without user
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  requireEmailVerification,
  authRateLimit,
  extractUser
};
