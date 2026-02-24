/**
 * Staff Routes
 * Staff management operations
 */

const express = require('express');
const router = express.Router();
const { Staff, Society, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { uploadBase64Image } = require('../config/s3');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Generate staff number
const generateStaffNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `STF-${timestamp}`;
};

// GET /api/v1/staff - List staff
router.get('/', authenticate, async (req, res) => {
  try {
    const { society_id, staff_type, is_active, limit = 50, offset = 0 } = req.query;
    
    const where = {};
    
    if (society_id) {
      where.society_id = society_id;
    } else if (req.user.society_id) {
      where.society_id = req.user.society_id;
    }
    
    if (staff_type) {
      where.staff_type = staff_type;
    }
    
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const staff = await Staff.findAndCountAll({
      where,
      include: [
        { model: Society, as: 'society', attributes: ['id', 'name'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['first_name', 'ASC']]
    });

    res.json({
      staff: staff.rows,
      total: staff.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Get staff error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/staff/:id - Get staff details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const staff = await Staff.findByPk(id, {
      include: [
        { model: Society, as: 'society', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'phone', 'email'] }
      ]
    });

    if (!staff) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Staff not found'
      });
    }

    res.json({ staff });
  } catch (error) {
    logger.error('Get staff error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// POST /api/v1/staff - Create staff
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { 
      society_id,
      first_name,
      last_name,
      phone,
      email,
      photo,
      staff_type,
      designation,
      date_of_joining,
      date_of_birth,
      gender,
      address,
      aadhaar_number,
      pan_number,
      salary,
      shift_timing,
      emergency_contact_name,
      emergency_contact_phone,
      notes
    } = req.body;

    const targetSocietyId = society_id || req.user.society_id;
    
    if (!targetSocietyId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Society ID is required'
      });
    }

    // Upload photo if provided
    let photoUrl = null;
    if (photo && photo.startsWith('data:')) {
      try {
        const uploaded = await uploadBase64Image(photo, 'staff');
        photoUrl = uploaded.url;
      } catch (uploadError) {
        logger.error('Photo upload error:', uploadError);
      }
    }

    // Create staff
    const staff = await Staff.create({
      society_id: targetSocietyId,
      staff_number: generateStaffNumber(),
      first_name,
      last_name,
      phone,
      email,
      photo: photoUrl,
      staff_type,
      designation,
      date_of_joining: date_of_joining || new Date(),
      date_of_birth,
      gender,
      address,
      aadhaar_number,
      pan_number,
      salary,
      shift_timing,
      emergency_contact_name,
      emergency_contact_phone,
      notes
    });

    logger.info(`Staff created: ${staff.staff_number}`);

    res.status(201).json({
      message: 'Staff created successfully',
      staff
    });
  } catch (error) {
    logger.error('Create staff error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/staff/:id - Update staff
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      first_name,
      last_name,
      phone,
      email,
      photo,
      staff_type,
      designation,
      date_of_birth,
      gender,
      address,
      aadhaar_number,
      pan_number,
      salary,
      shift_timing,
      is_active,
      termination_date,
      emergency_contact_name,
      emergency_contact_phone,
      notes
    } = req.body;
    
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Staff not found'
      });
    }

    // Upload new photo if provided
    let photoUrl = staff.photo;
    if (photo && photo.startsWith('data:')) {
      try {
        const uploaded = await uploadBase64Image(photo, 'staff');
        photoUrl = uploaded.url;
      } catch (uploadError) {
        logger.error('Photo upload error:', uploadError);
      }
    }

    await staff.update({
      first_name: first_name || staff.first_name,
      last_name: last_name !== undefined ? last_name : staff.last_name,
      phone: phone || staff.phone,
      email: email !== undefined ? email : staff.email,
      photo: photoUrl,
      staff_type: staff_type || staff.staff_type,
      designation: designation !== undefined ? designation : staff.designation,
      date_of_birth: date_of_birth !== undefined ? date_of_birth : staff.date_of_birth,
      gender: gender !== undefined ? gender : staff.gender,
      address: address !== undefined ? address : staff.address,
      aadhaar_number: aadhaar_number !== undefined ? aadhaar_number : staff.aadhaar_number,
      pan_number: pan_number !== undefined ? pan_number : staff.pan_number,
      salary: salary !== undefined ? salary : staff.salary,
      shift_timing: shift_timing !== undefined ? shift_timing : staff.shift_timing,
      is_active: is_active !== undefined ? is_active : staff.is_active,
      termination_date: termination_date !== undefined ? termination_date : staff.termination_date,
      emergency_contact_name: emergency_contact_name !== undefined ? emergency_contact_name : staff.emergency_contact_name,
      emergency_contact_phone: emergency_contact_phone !== undefined ? emergency_contact_phone : staff.emergency_contact_phone,
      notes: notes !== undefined ? notes : staff.notes
    });

    res.json({
      message: 'Staff updated successfully',
      staff
    });
  } catch (error) {
    logger.error('Update staff error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: error.message
    });
  }
});

// DELETE /api/v1/staff/:id - Delete staff
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Staff not found'
      });
    }

    // Soft delete
    await staff.update({ is_active: false, termination_date: new Date() });

    res.json({
      message: 'Staff deleted successfully'
    });
  } catch (error) {
    logger.error('Delete staff error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: error.message
    });
  }
});

module.exports = router;
