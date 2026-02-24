/**
 * Bill Routes
 * Maintenance bill generation and management
 */

const express = require('express');
const router = express.Router();
const { Bill, Flat, Block, Society, User, Payment } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { sendNotification, sendTopicNotification } = require('../config/firebase');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Generate bill number
const generateBillNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BL-${timestamp}${random}`;
};

// GET /api/v1/bills - List bills
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      society_id, 
      flat_id, 
      status, 
      bill_month, 
      bill_year,
      from_date,
      to_date,
      limit = 50, 
      offset = 0 
    } = req.query;
    
    const where = {};
    
    if (society_id) {
      where.society_id = society_id;
    } else if (req.user.society_id) {
      where.society_id = req.user.society_id;
    }
    
    if (flat_id) {
      where.flat_id = flat_id;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (bill_month && bill_year) {
      where.bill_month = parseInt(bill_month);
      where.bill_year = parseInt(bill_year);
    }
    
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at[Op.gte] = new Date(from_date);
      if (to_date) where.created_at[Op.lte] = new Date(to_date);
    }

    // For residents, only show their flat's bills
    if (req.user.flat_id && !flat_id) {
      where.flat_id = req.user.flat_id;
    }

    const bills = await Bill.findAndCountAll({
      where,
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] },
        { model: Society, as: 'society', attributes: ['id', 'name'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      bills: bills.rows,
      total: bills.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Get bills error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/bills/:id - Get bill details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const bill = await Bill.findByPk(id, {
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] },
        { model: Society, as: 'society' },
        { model: User, as: 'generator', attributes: ['id', 'first_name', 'last_name'] },
        { model: Payment, as: 'payments' }
      ]
    });

    if (!bill) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Bill not found'
      });
    }

    // Check access for residents
    if (req.user.flat_id && bill.flat_id !== req.user.flat_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied'
      });
    }

    res.json({ bill });
  } catch (error) {
    logger.error('Get bill error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// POST /api/v1/bills - Create bill
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { 
      society_id, 
      flat_id,
      bill_type,
      bill_month,
      bill_year,
      amount,
      meter_charge,
      parking_charge,
      penalty_amount,
      discount_amount,
      due_date,
      description
    } = req.body;

    // Verify flat exists
    const flat = await Flat.findByPk(flat_id);
    if (!flat) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Flat not found'
      });
    }

    // Check for existing bill for same month/year/flat
    const existingBill = await Bill.findOne({
      where: {
        flat_id,
        bill_month,
        bill_year,
        status: { [Op.ne]: 'CANCELLED' }
      }
    });
    
    if (existingBill) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Bill already exists for this month and flat'
      });
    }

    // Create bill
    const bill = await Bill.create({
      society_id: society_id || flat.society_id,
      flat_id,
      bill_number: generateBillNumber(),
      bill_type: bill_type || 'MONTHLY',
      bill_month,
      bill_year,
      amount: amount || flat.maintenance_amount,
      meter_charge: meter_charge || 0,
      parking_charge: parking_charge || 0,
      penalty_amount: penalty_amount || 0,
      discount_amount: discount_amount || 0,
      due_date,
      description,
      generated_by: req.user.id
    });

    // Get flat owner for notification
    const owner = await User.findOne({
      where: { 
        flat_id,
        user_type: { [Op.in]: ['OWNER', 'RESIDENT'] },
        is_active: true
      }
    });

    // Send push notification to owner
    if (owner && owner.fcm_token) {
      try {
        await sendNotification(
          owner.fcm_token,
          'New Maintenance Bill',
          `Bill for ${bill.bill_month}/${bill.bill_year} - Rs. ${bill.total_amount}`,
          { bill_id: bill.id, type: 'bill' }
        );
      } catch (notifError) {
        logger.error('Notification error:', notifError);
      }
    }

    logger.info(`Bill created: ${bill.bill_number} for flat ${flat_id}`);

    res.status(201).json({
      message: 'Bill created successfully',
      bill
    });
  } catch (error) {
    logger.error('Create bill error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: error.message
    });
  }
});

// POST /api/v1/bills/generate - Generate bills for all flats
router.post('/generate', authenticate, isAdmin, async (req, res) => {
  try {
    const { 
      society_id, 
      bill_type,
      bill_month,
      bill_year,
      due_date,
      description
    } = req.body;

    const targetSocietyId = society_id || req.user.society_id;
    
    if (!targetSocietyId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Society ID is required'
      });
    }

    // Get all active flats in society
    const flats = await Flat.findAll({
      where: { 
        society_id: targetSocietyId,
        is_active: true,
        is_occupied: true
      }
    });

    const createdBills = [];
    const errors = [];

    for (const flat of flats) {
      try {
        // Check for existing bill
        const existingBill = await Bill.findOne({
          where: {
            flat_id: flat.id,
            bill_month,
            bill_year,
            status: { [Op.ne]: 'CANCELLED' }
          }
        });
        
        if (existingBill) {
          errors.push({ flat_id: flat.id, error: 'Bill already exists' });
          continue;
        }

        const bill = await Bill.create({
          society_id: targetSocietyId,
          flat_id: flat.id,
          bill_number: generateBillNumber(),
          bill_type: bill_type || 'MONTHLY',
          bill_month,
          bill_year,
          amount: flat.maintenance_amount,
          due_date,
          description,
          generated_by: req.user.id
        });

        createdBills.push(bill);
      } catch (billError) {
        errors.push({ flat_id: flat.id, error: billError.message });
      }
    }

    // Send notification to all residents
    const society = await Society.findByPk(targetSocietyId);
    if (society) {
      try {
        await sendTopicNotification(
          `society_${targetSocietyId}`,
          'Maintenance Bills Generated',
          `Bills for ${bill_month}/${bill_year} have been generated. Please check your app for details.`,
          { type: 'bill' }
        );
      } catch (notifError) {
        logger.error('Topic notification error:', notifError);
      }
    }

    logger.info(`Generated ${createdBills.length} bills for society ${targetSocietyId}`);

    res.status(201).json({
      message: `Successfully generated ${createdBills.length} bills`,
      created: createdBills.length,
      errors: errors.length,
      details: { createdBills, errors }
    });
  } catch (error) {
    logger.error('Generate bills error:', error);
    res.status(500).json({
      error: 'Generation Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/bills/:id - Update bill
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      amount,
      meter_charge,
      parking_charge,
      penalty_amount,
      discount_amount,
      due_date,
      description,
      status
    } = req.body;
    
    const bill = await Bill.findByPk(id);
    if (!bill) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Bill not found'
      });
    }

    // Cannot update paid bills
    if (bill.status === 'PAID') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot update a paid bill'
      });
    }

    await bill.update({
      amount: amount !== undefined ? amount : bill.amount,
      meter_charge: meter_charge !== undefined ? meter_charge : bill.meter_charge,
      parking_charge: parking_charge !== undefined ? parking_charge : bill.parking_charge,
      penalty_amount: penalty_amount !== undefined ? penalty_amount : bill.penalty_amount,
      discount_amount: discount_amount !== undefined ? discount_amount : bill.discount_amount,
      due_date: due_date || bill.due_date,
      description: description !== undefined ? description : bill.description,
      status: status !== undefined ? status : bill.status
    });

    res.json({
      message: 'Bill updated successfully',
      bill
    });
  } catch (error) {
    logger.error('Update bill error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: error.message
    });
  }
});

// DELETE /api/v1/bills/:id - Cancel bill
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const bill = await Bill.findByPk(id);
    if (!bill) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Bill not found'
      });
    }

    // Cannot cancel paid bills
    if (bill.status === 'PAID') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot cancel a paid bill'
      });
    }

    await bill.update({ status: 'CANCELLED' });

    res.json({
      message: 'Bill cancelled successfully'
    });
  } catch (error) {
    logger.error('Cancel bill error:', error);
    res.status(500).json({
      error: 'Cancel Failed',
      message: error.message
    });
  }
});

module.exports = router;
