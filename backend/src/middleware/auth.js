/**
 * Authentication Middleware
 * JWT token verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { User } = require('../models');

/**
 * Verify JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    req.userId = user.id;
    req.societyId = user.society_id;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    logger.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Role-based access control
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

/**
 * Check specific permissions
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userPermissions = req.user.role?.permissions || {};
    
    if (userPermissions.all || userPermissions[permission]) {
      return next();
    }

    return res.status(403).json({ error: 'Permission denied' });
  };
};

module.exports = {
  authenticate,
  authorize,
  checkPermission
};
