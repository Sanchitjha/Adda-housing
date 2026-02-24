/**
 * Amenity Routes
 * Amenity CRUD operations
 */

const express = require('express');
const router = express.Router();
const { Amenity, Society } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { uploadBase64Image } = require('../config/s3');
const logger = require('../utils/logger');

// GET /api/v1/amenities - List amenities
router.get('/', authenticate, async (req, res) => {
  try {
    const { society_id, amenity_type, is_active } = req.query;
    
    const where = {};
    
    if (society_id) {
      where.society_id = society_id;
    } else if (req.user.society_id) {
      where.society_id = req.user.society_id;
    }
    
    if (amenity_type) {
      where.amenity_type = amenity_type;
    }
    
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    } else {
      where.is_active = true;
    }

    const amenities = await Amenity.findAll({
      where,
      include: [
        { model: Society, as: 'society', attributes: ['id', 'name'] }
      ],
      order: [['name', 'ASC']]
    });

    res.json({ amenities });
  } catch (error) {
    logger.error('Get amenities error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/amenities/:id - Get amenity details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const amenity = await Amenity.findByPk(id, {
      include: [
        { model: Society, as: 'society', attributes: ['id', 'name'] }
      ]
    });

    if (!amenity) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Amenity not found'
      });
    }

    res.json({ amenity });
  } catch (error) {
    logger.error('Get amenity error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// POST /api/v1/amenities - Create amenity
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { 
      society_id,
      name,
      description,
      amenity_type,
      location,
      capacity,
      timing_open,
      timing_close,
      booking_charge,
      security_deposit,
      max_advance_days,
      min_booking_hours,
      max_booking_hours,
      requires_approval,
      image_url,
      is_available_for_all
    } = req.body;

    const targetSocietyId = society_id || req.user.society_id;
    
    if (!targetSocietyId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Society ID is required'
      });
    }

    // Upload image if provided
    let imageUrl = image_url;
    if (image_url && image_url.startsWith('data:')) {
      try {
        const uploaded = await uploadBase64Image(image_url, 'amenities');
        imageUrl = uploaded.url;
      } catch (uploadError) {
        logger.error('Image upload error:', uploadError);
      }
    }

    const amenity = await Amenity.create({
      society_id: targetSocietyId,
      name,
      description,
      amenity_type,
      location,
      capacity: capacity || 0,
      timing_open,
      timing_close,
      booking_charge: booking_charge || 0,
      security_deposit: security_deposit || 0,
      max_advance_days: max_advance_days || 7,
      min_booking_hours: min_booking_hours || 1,
      max_booking_hours: max_booking_hours || 4,
      requires_approval: requires_approval !== false,
      image_url: imageUrl,
      is_available_for_all: is_available_for_all !== false
    });

    logger.info(`Amenity created: ${amenity.id}`);

    res.status(201).json({
      message: 'Amenity created successfully',
      amenity
    });
  } catch (error) {
    logger.error('Create amenity error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/amenities/:id - Update amenity
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name,
      description,
      amenity_type,
      location,
      capacity,
      timing_open,
      timing_close,
      booking_charge,
      security_deposit,
      max_advance_days,
      min_booking_hours,
      max_booking_hours,
      requires_approval,
      image_url,
      is_active,
      is_available_for_all
    } = req.body;
    
    const amenity = await Amenity.findByPk(id);
    if (!amenity) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Amenity not found'
      });
    }

    // Upload new image if provided
    let imageUrl = amenity.image_url;
    if (image_url && image_url.startsWith('data:')) {
      try {
        const uploaded = await uploadBase64Image(image_url, 'amenities');
        imageUrl = uploaded.url;
      } catch (uploadError) {
        logger.error('Image upload error:', uploadError);
      }
    }

    await amenity.update({
      name: name || amenity.name,
      description: description !== undefined ? description : amenity.description,
      amenity_type: amenity_type || amenity.amenity_type,
      location: location !== undefined ? location : amenity.location,
      capacity: capacity !== undefined ? capacity : amenity.capacity,
      timing_open: timing_open !== undefined ? timing_open : amenity.timing_open,
      timing_close: timing_close !== undefined ? timing_close : amenity.timing_close,
      booking_charge: booking_charge !== undefined ? booking_charge : amenity.booking_charge,
      security_deposit: security_deposit !== undefined ? security_deposit : amenity.security_deposit,
      max_advance_days: max_advance_days !== undefined ? max_advance_days : amenity.max_advance_days,
      min_booking_hours: min_booking_hours !== undefined ? min_booking_hours : amenity.min_booking_hours,
      max_booking_hours: max_booking_hours !== undefined ? max_booking_hours : amenity.max_booking_hours,
      requires_approval: requires_approval !== undefined ? requires_approval : amenity.requires_approval,
      image_url: imageUrl,
      is_active: is_active !== undefined ? is_active : amenity.is_active,
      is_available_for_all: is_available_for_all !== undefined ? is_available_for_all : amenity.is_available_for_all
    });

    res.json({
      message: 'Amenity updated successfully',
      amenity
    });
  } catch (error) {
    logger.error('Update amenity error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: error.message
    });
  }
});

// DELETE /api/v1/amenities/:id - Delete amenity
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const amenity = await Amenity.findByPk(id);
    if (!amenity) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Amenity not found'
      });
    }

    await amenity.update({ is_active: false });

    res.json({
      message: 'Amenity deleted successfully'
    });
  } catch (error) {
    logger.error('Delete amenity error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: error.message
    });
  }
});

module.exports = router;
