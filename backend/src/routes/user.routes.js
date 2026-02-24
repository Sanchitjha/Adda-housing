/**
 * User Routes
 * User management operations
 */

const express = require('express');
const router = express.Router();
const { User, Flat, Society, Role } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { uploadBase64Image } = require('../config/s3');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// GET /api/v1/users - List users
router.get('/', authenticate, async (req, res) => {
  try {
    const { society_id, flat_id, user_type, search, is_active, limit = 50, offset = 0 } = req.query;
    
    const where = {};
    
    if (society_id) {
      where.society_id = society_id;
    } else if (req.user.society_id) {
      where.society_id = req.user.society_id;
    }
    
    if (flat_id) {
      where.flat_id = flat_id;
    }
    
    if (user_type) {
      where.user_type = user_type;
    }
    
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }
    
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where,
      include: [
        { model: Flat, as: 'flat', attributes: ['id', 'flat_number', 'block_id'] },
        { model: Society, as: 'society', attributes: ['id', 'name'] },
        { model: Role, as: 'role', attributes: ['id', 'name', 'code'] }
      ],
      attributes: { exclude: ['password', 'otp', 'otp_expires_at', 'password_reset_token', 'password_reset_expires'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['first_name', 'ASC']]
    });

    res.json({
      users: users.rows,
      total: users.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/users/:id - Get user details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] },
        { model: Society, as: 'society' },
        { model: Role, as: 'role' }
      ],
      attributes: { exclude: ['password', 'otp', 'otp_expires_at', 'password_reset_token', 'password_reset_expires'] }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({ user });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/users/:id - Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only update their own profile, admins can update any
    if (req.user.id !== id && !['ADMIN', 'CHAIRMAN', 'SECRETARY'].includes(req.user.user_type)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own profile'
      });
    }

    const { 
      first_name,
      last_name,
      email,
      date_of_birth,
      gender,
      aadhaar_number,
      blood_group,
      emergency_contact_name,
      emergency_contact_phone,
      profile_image,
      role_id
    } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Upload profile image if provided
    let profileImageUrl = user.profile_image;
    if (profile_image && profile_image.startsWith('data:')) {
      try {
        const uploaded = await uploadBase64Image(profile_image, 'profiles');
        profileImageUrl = uploaded.url;
      } catch (uploadError) {
        logger.error('Profile image upload error:', uploadError);
      }
    }

    // Admin can change role
    let updateData = {
      first_name: first_name || user.first_name,
      last_name: last_name !== undefined ? last_name : user.last_name,
      email: email !== undefined ? email : user.email,
      date_of_birth: date_of_birth !== undefined ? date_of_birth : user.date_of_birth,
      gender: gender !== undefined ? gender : user.gender,
      aadhaar_number: aadhaar_number !== undefined ? aadhaar_number : user.aadhaar_number,
      blood_group: blood_group !== undefined ? blood_group : user.blood_group,
      emergency_contact_name: emergency_contact_name !== undefined ? emergency_contact_name : user.emergency_contact_name,
      emergency_contact_phone: emergency_contact_phone !== undefined ? emergency_contact_phone : user.emergency_contact_phone,
      profile_image: profileImageUrl
    };

    // Only admin can change role
    if (role_id && ['ADMIN', 'CHAIRMAN', 'SECRETARY'].includes(req.user.user_type)) {
      updateData.role_id = role_id;
    }

    await user.update(updateData);

    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: error.message
    });
  }
});

// DELETE /api/v1/users/:id - Deactivate user
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot deactivate your own account'
      });
    }

    await user.update({ is_active: false });

    res.json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: error.message
    });
  }
});

// POST /api/v1/users/:id/change-password - Change password
router.post('/:id/change-password', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;
    
    // Users can only change their own password
    if (req.user.id !== id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only change your own password'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Verify current password
    const isValid = await user.comparePassword(current_password);
    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid Password',
        message: 'Current password is incorrect'
      });
    }

    await user.update({ password: new_password });

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      error: 'Change Failed',
      message: error.message
    });
  }
});

// Import Block for flat include
const Block = require('../models/Block');

module.exports = router;
