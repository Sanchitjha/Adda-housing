/**
 * Authentication Middleware
 * JWT Token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'User not found'
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Account is deactivated'
        });
      }

      // Attach user to request
      req.user = user;
      req.token = token;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Token expired'
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid token'
        });
      }
      throw jwtError;
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (user && user.is_active) {
      req.user = user;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // Continue without auth for optional routes
    next();
  }
};

module.exports = { authenticate, optionalAuth };
