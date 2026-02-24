/**
 * Role-Based Access Control (RBAC) Middleware
 * Handles permission-based route access
 */

const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const logger = require('../utils/logger');

/**
 * Check if user has required role
 * @param {...string} roles - Allowed roles
 */
const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const userRole = req.user.user_type;
      
      if (!allowedRoles.includes(userRole)) {
        logger.warn(`Access denied: User ${req.user.id} with role ${userRole} attempted to access ${req.originalUrl}`);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource'
        });
      }

      next();
    } catch (error) {
      logger.error('RBAC error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Authorization failed'
      });
    }
  };
};

/**
 * Check if user is admin (admin, chairman, secretary)
 */
const isAdmin = checkRole('ADMIN', 'CHAIRMAN', 'SECRETARY', 'ACCOUNTANT');

/**
 * Check if user is resident (owner or tenant)
 */
const isResident = checkRole('OWNER', 'TENANT', 'RESIDENT');

/**
 * Check if user is staff
 */
const isStaff = checkRole('STAFF', 'SECURITY');

/**
 * Check if user is guard
 */
const isGuard = checkRole('GUARD', 'SECURITY');

/**
 * Check society membership
 */
const checkSocietyMember = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Allow admins to access any society
    if (['ADMIN'].includes(req.user.user_type)) {
      return next();
    }

    const societyId = req.params.societyId || req.body.society_id;
    
    if (!societyId) {
      return next();
    }

    if (req.user.society_id !== societyId) {
      logger.warn(`Access denied: User ${req.user.id} attempted to access society ${societyId}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this society'
      });
    }

    next();
  } catch (error) {
    logger.error('Society check error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authorization failed'
    });
  }
};

/**
 * Custom permission check
 */
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      // Admin users have all permissions
      if (['ADMIN', 'CHAIRMAN'].includes(req.user.user_type)) {
        return next();
      }

      // Get user's role and check permissions
      if (req.user.role_id) {
        const role = await Role.findByPk(req.user.role_id);
        
        if (role && role.permissions && role.permissions[permission]) {
          return next();
        }
      }

      logger.warn(`Permission denied: User ${req.user.id} lacks permission ${permission}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have the required permission'
      });
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Authorization failed'
      });
    }
  };
};

module.exports = {
  checkRole,
  checkPermission,
  isAdmin,
  isResident,
  isStaff,
  isGuard,
  checkSocietyMember
};
