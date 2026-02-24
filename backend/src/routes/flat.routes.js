/**
 * Flat Routes
 * CRUD operations for flats/apartments
 */

const express = require('express');
const router = express.Router();
const { Flat, Block, Society, User, Bill, Payment } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// GET /api/v1/flats - List flats
router.get('/', authenticate, async (req, res) => {
  try {
    const { society_id, block_id, search, type, is_occupied, limit = 50, offset = 0 } = req.query;
    
    const where = {};
    
    if (society_id) {
      where.society_id = society_id;
    } else if (req.user.society_id) {
      where.society_id = req.user.society_id;
    }
    
    if (block_id) {
      where.block_id = block_id;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (is_occupied !== undefined) {
      where.is_occupied = is_occupied === 'true';
    }
    
    if (search) {
      where[Op.or] = [
        { flat_number: { [Op.iLike]: `%${search}%` } },
        { owner_name: { [Op.iLike]: `%${search}%` } },
        { tenant_name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const flats = await Flat.findAndCountAll({
      where,
      include: [
        { model: Block, as: 'block', attributes: ['id', 'name', 'code'] },
        { model: Society, as: 'society', attributes: ['id', 'name'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['block_id', 'ASC'], ['flat_number', 'ASC']]
    });

    res.json({
      flats: flats.rows,
      total: flats.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Get flats error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/flats/:id - Get flat details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const flat = await Flat.findByPk(id, {
      include: [
        { model: Block, as: 'block', attributes: ['id', 'name', 'code'] },
        { model: Society, as: 'society', attributes: ['id', 'name'] },
        { 
          model: User, 
          as: 'residents', 
          attributes: ['id', 'first_name', 'last_name', 'phone', 'email', 'user_type'],
          where: { is_active: true },
          required: false
        }
      ]
    });

    if (!flat) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Flat not found'
      });
    }

    // Get pending bills count
    const pendingBills = await Bill.count({
      where: { 
        flat_id: id,
        status: { [Op.in]: ['PENDING', 'OVERDUE'] }
      }
    });

    // Get last payment
    const lastPayment = await Payment.findOne({
      where: { flat_id: id, status: 'COMPLETED' },
      order: [['payment_date', 'DESC']]
    });

    res.json({
      flat,
      pending_bills: pendingBills,
      last_payment: lastPayment
    });
  } catch (error) {
    logger.error('Get flat error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// POST /api/v1/flats - Create flat
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { 
      society_id, 
      block_id, 
      flat_number, 
      floor, 
      type, 
      square_feet,
      owner_name,
      owner_phone,
      owner_email,
      tenant_name,
      tenant_phone,
      maintenance_amount,
      is_occupied,
      is_owner_occupied,
      parking_slot,
      vehicle_number
    } = req.body;

    // Verify block exists
    const block = await Block.findByPk(block_id);
    if (!block) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Block not found'
      });
    }

    // Check for duplicate flat number in block
    const existingFlat = await Flat.findOne({
      where: { 
        block_id,
        flat_number: flat_number.toUpperCase()
      }
    });
    
    if (existingFlat) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Flat number already exists in this block'
      });
    }

    // Calculate maintenance amount if not provided
    let maintenance = maintenance_amount;
    if (!maintenance) {
      const society = await Society.findByPk(block.society_id);
      if (society && society.maintenance_per_sqft && square_feet) {
        maintenance = society.maintenance_per_sqft * square_feet;
      }
    }

    // Create flat
    const flat = await Flat.create({
      society_id: block.society_id,
      block_id,
      flat_number: flat_number.toUpperCase(),
      floor,
      type: type || '2BHK',
      square_feet,
      owner_name,
      owner_phone,
      owner_email,
      tenant_name,
      tenant_phone,
      maintenance_amount: maintenance || 0,
      is_occupied: is_occupied || false,
      is_owner_occupied: is_owner_occupied !== false,
      parking_slot,
      vehicle_number
    });

    // Update society flat count
    const society = await Society.findByPk(block.society_id);
    if (society) {
      await society.update({
        total_flats: await Flat.count({ where: { society_id: society.id } })
      });
    }

    logger.info(`Flat created: ${flat.id} in block ${block_id}`);

    res.status(201).json({
      message: 'Flat created successfully',
      flat
    });
  } catch (error) {
    logger.error('Create flat error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/flats/:id - Update flat
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      flat_number, 
      floor, 
      type, 
      square_feet,
      owner_name,
      owner_phone,
      owner_email,
      tenant_name,
      tenant_phone,
      maintenance_amount,
      is_occupied,
      is_owner_occupied,
      parking_slot,
      vehicle_number,
      is_active
    } = req.body;
    
    const flat = await Flat.findByPk(id);
    if (!flat) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Flat not found'
      });
    }

    await flat.update({
      flat_number: flat_number ? flat_number.toUpperCase() : flat.flat_number,
      floor: floor !== undefined ? floor : flat.floor,
      type: type || flat.type,
      square_feet: square_feet !== undefined ? square_feet : flat.square_feet,
      owner_name: owner_name !== undefined ? owner_name : flat.owner_name,
      owner_phone: owner_phone !== undefined ? owner_phone : flat.owner_phone,
      owner_email: owner_email !== undefined ? owner_email : flat.owner_email,
      tenant_name: tenant_name !== undefined ? tenant_name : flat.tenant_name,
      tenant_phone: tenant_phone !== undefined ? tenant_phone : flat.tenant_phone,
      maintenance_amount: maintenance_amount !== undefined ? maintenance_amount : flat.maintenance_amount,
      is_occupied: is_occupied !== undefined ? is_occupied : flat.is_occupied,
      is_owner_occupied: is_owner_occupied !== undefined ? is_owner_occupied : flat.is_owner_occupied,
      parking_slot: parking_slot !== undefined ? parking_slot : flat.parking_slot,
      vehicle_number: vehicle_number !== undefined ? vehicle_number : flat.vehicle_number,
      is_active: is_active !== undefined ? is_active : flat.is_active
    });

    res.json({
      message: 'Flat updated successfully',
      flat
    });
  } catch (error) {
    logger.error('Update flat error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: error.message
    });
  }
});

// DELETE /api/v1/flats/:id - Delete flat
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const flat = await Flat.findByPk(id);
    if (!flat) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Flat not found'
      });
    }

    // Check for active bills
    const pendingBills = await Bill.count({
      where: { 
        flat_id: id,
        status: { [Op.in]: ['PENDING', 'OVERDUE'] }
      }
    });

    if (pendingBills > 0) {
      return res.status(400).json({
        error: 'Cannot Delete',
        message: 'Cannot delete flat with pending bills'
      });
    }

    // Soft delete
    await flat.update({ is_active: false });

    // Update society flat count
    const society = await Society.findByPk(flat.society_id);
    if (society) {
      await society.update({
        total_flats: await Flat.count({ where: { society_id: society.id } })
      });
    }

    res.json({
      message: 'Flat deleted successfully'
    });
  } catch (error) {
    logger.error('Delete flat error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: error.message
    });
  }
});

// POST /api/v1/flats/:id/assign-user - Assign user to flat
router.post('/:id/assign-user', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, user_type } = req.body;
    
    const flat = await Flat.findByPk(id);
    if (!flat) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Flat not found'
      });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Update user
    await user.update({
      flat_id: id,
      society_id: flat.society_id,
      user_type: user_type || user.user_type
    });

    // Update flat occupancy
    await flat.update({
      is_occupied: true,
      is_owner_occupied: user_type === 'OWNER'
    });

    res.json({
      message: 'User assigned to flat successfully',
      flat,
      user
    });
  } catch (error) {
    logger.error('Assign user error:', error);
    res.status(500).json({
      error: 'Assignment Failed',
      message: error.message
    });
  }
});

module.exports = router;
