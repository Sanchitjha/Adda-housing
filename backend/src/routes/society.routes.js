/**
 * Society Routes
 * CRUD operations for housing societies
 */

const express = require('express');
const router = express.Router();
const { Society, Block, Flat, User, Role } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { uploadBase64Image } = require('../config/s3');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// GET /api/v1/societies - List all societies (public)
router.get('/', async (req, res) => {
  try {
    const { search, city, state, limit = 20, offset = 0 } = req.query;

    const where = { is_active: true };
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (city) {
      where.city = { [Op.iLike]: `%${city}%` };
    }
    
    if (state) {
      where.state = { [Op.iLike]: `%${state}%` };
    }

    const societies = await Society.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      societies: societies.rows,
      total: societies.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Get societies error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/societies/:id - Get society details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const society = await Society.findByPk(id, {
      include: [
        { model: Block, as: 'blocks', attributes: ['id', 'name', 'code', 'total_floors'] }
      ]
    });

    if (!society) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Society not found'
      });
    }

    // Get flat count
    const flatCount = await Flat.count({ where: { society_id: id } });

    res.json({
      society,
      stats: {
        total_blocks: society.total_blocks,
        total_flats: flatCount
      }
    });
  } catch (error) {
    logger.error('Get society error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// POST /api/v1/societies - Create society (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      pincode,
      registration_number,
      logo,
      contact_email,
      contact_phone,
      maintenance_per_sqft,
      bank_name,
      bank_account_number,
      bank_ifsc,
      razorpay_key_id
    } = req.body;

    // Upload logo if provided
    let logoUrl = logo;
    if (logo && logo.startsWith('data:')) {
      try {
        const uploaded = await uploadBase64Image(logo, 'societies/logos');
        logoUrl = uploaded.url;
      } catch (uploadError) {
        logger.error('Logo upload error:', uploadError);
      }
    }

    // Create society
    const society = await Society.create({
      name,
      address,
      city,
      state,
      pincode,
      registration_number,
      logo: logoUrl,
      contact_email,
      contact_phone,
      maintenance_per_sqft: maintenance_per_sqft || 2.5,
      bank_name,
      bank_account_number,
      bank_ifsc,
      razorpay_key_id,
      created_by: req.user.id
    });

    // Create default roles for the society
    await Role.bulkCreate([
      {
        society_id: society.id,
        name: 'Chairman',
        code: 'CHAIRMAN',
        description: 'Chairman of the society',
        permissions: {
          manage_members: true,
          manage_bills: true,
          manage_complaints: true,
          manage_staff: true,
          view_reports: true,
          manage_notices: true,
          manage_amenities: true
        },
        is_system_role: true
      },
      {
        society_id: society.id,
        name: 'Secretary',
        code: 'SECRETARY',
        description: 'Secretary of the society',
        permissions: {
          manage_members: true,
          manage_bills: true,
          manage_complaints: true,
          manage_staff: true,
          view_reports: true,
          manage_notices: true,
          manage_amenities: true
        },
        is_system_role: true
      },
      {
        society_id: society.id,
        name: 'Accountant',
        code: 'ACCOUNTANT',
        description: 'Accountant of the society',
        permissions: {
          manage_bills: true,
          view_reports: true,
          manage_payments: true
        },
        is_system_role: true
      },
      {
        society_id: society.id,
        name: 'Security',
        code: 'SECURITY',
        description: 'Security personnel',
        permissions: {
          manage_visitors: true,
          view_notices: true
        },
        is_system_role: true
      }
    ]);

    logger.info(`Society created: ${society.id} by user ${req.user.id}`);

    res.status(201).json({
      message: 'Society created successfully',
      society
    });
  } catch (error) {
    logger.error('Create society error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/societies/:id - Update society
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const society = await Society.findByPk(id);
    if (!society) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Society not found'
      });
    }

    const {
      name,
      address,
      city,
      state,
      pincode,
      registration_number,
      logo,
      contact_email,
      contact_phone,
      maintenance_per_sqft,
      bank_name,
      bank_account_number,
      bank_ifsc,
      razorpay_key_id,
      is_active
    } = req.body;

    // Upload logo if provided and changed
    let logoUrl = society.logo;
    if (logo && logo.startsWith('data:')) {
      try {
        const uploaded = await uploadBase64Image(logo, 'societies/logos');
        logoUrl = uploaded.url;
      } catch (uploadError) {
        logger.error('Logo upload error:', uploadError);
      }
    }

    await society.update({
      name: name || society.name,
      address: address || society.address,
      city: city || society.city,
      state: state || society.state,
      pincode: pincode || society.pincode,
      registration_number: registration_number || society.registration_number,
      logo: logoUrl,
      contact_email: contact_email || society.contact_email,
      contact_phone: contact_phone || society.contact_phone,
      maintenance_per_sqft: maintenance_per_sqft || society.maintenance_per_sqft,
      bank_name: bank_name || society.bank_name,
      bank_account_number: bank_account_number || society.bank_account_number,
      bank_ifsc: bank_ifsc || society.bank_ifsc,
      razorpay_key_id: razorpay_key_id || society.razorpay_key_id,
      is_active: is_active !== undefined ? is_active : society.is_active
    });

    res.json({
      message: 'Society updated successfully',
      society
    });
  } catch (error) {
    logger.error('Update society error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: error.message
    });
  }
});

// DELETE /api/v1/societies/:id - Delete society (soft delete)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const society = await Society.findByPk(id);
    if (!society) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Society not found'
      });
    }

    await society.update({ is_active: false });

    res.json({
      message: 'Society deleted successfully'
    });
  } catch (error) {
    logger.error('Delete society error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: error.message
    });
  }
});

// GET /api/v1/societies/:id/stats - Get society statistics
router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const society = await Society.findByPk(id);
    if (!society) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Society not found'
      });
    }

    // Get various counts
    const [
      totalBlocks,
      totalFlats,
      totalResidents,
      totalOwners,
      totalTenants,
      occupiedFlats
    ] = await Promise.all([
      Block.count({ where: { society_id: id } }),
      Flat.count({ where: { society_id: id } }),
      User.count({ 
        where: { 
          society_id: id,
          is_active: true 
        } 
      }),
      User.count({ 
        where: { 
          society_id: id,
          user_type: 'OWNER',
          is_active: true 
        } 
      }),
      User.count({ 
        where: { 
          society_id: id,
          user_type: 'TENANT',
          is_active: true 
        } 
      }),
      Flat.count({ 
        where: { 
          society_id: id,
          is_occupied: true 
        } 
      })
    ]);

    res.json({
      stats: {
        total_blocks: totalBlocks,
        total_flats: totalFlats,
        occupied_flats: occupiedFlats,
        vacant_flats: totalFlats - occupiedFlats,
        total_residents: totalResidents,
        total_owners: totalOwners,
        total_tenants: totalTenants
      }
    });
  } catch (error) {
    logger.error('Get society stats error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

module.exports = router;
