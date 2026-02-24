/**
 * Visitor Routes
 * Visitor management and approval
 */

const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { Visitor, Flat, Block, Society, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin, isGuard } = require('../middleware/rbac');
const { uploadBase64Image } = require('../config/s3');
const { sendNotification } = require('../config/firebase');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Generate visitor number
const generateVisitorNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `VIS-${timestamp}${random}`;
};

// GET /api/v1/visitors - List visitors
router.get('/', authenticate, async (req, res) => {
  try {
    const { society_id, flat_id, visitor_type, status, from_date, to_date, limit = 50, offset = 0 } = req.query;
    
    const where = {};
    
    if (society_id) {
      where.society_id = society_id;
    } else if (req.user.society_id) {
      where.society_id = req.user.society_id;
    }
    
    if (flat_id) {
      where.flat_id = flat_id;
    }
    
    if (visitor_type) {
      where.visitor_type = visitor_type;
    }
    
    if (status) {
      where.status = status;
    }

    // For residents, only show visitors for their flat
    if (req.user.flat_id && !flat_id) {
      where.flat_id = req.user.flat_id;
    }

    if (from_date || to_date) {
      where.entry_time = {};
      if (from_date) where.entry_time[Op.gte] = new Date(from_date);
      if (to_date) where.entry_time[Op.lte] = new Date(to_date);
    }

    const visitors = await Visitor.findAndCountAll({
      where,
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] },
        { model: User, as: 'approver', attributes: ['id', 'first_name', 'last_name'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['entry_time', 'DESC']]
    });

    res.json({
      visitors: visitors.rows,
      total: visitors.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Get visitors error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/visitors/:id - Get visitor details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const visitor = await Visitor.findByPk(id, {
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] },
        { model: Society, as: 'society', attributes: ['id', 'name'] },
        { model: User, as: 'entryGuard', attributes: ['id', 'first_name', 'last_name'] },
        { model: User, as: 'exitGuard', attributes: ['id', 'first_name', 'last_name'] },
        { model: User, as: 'approver', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    if (!visitor) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Visitor not found'
      });
    }

    res.json({ visitor });
  } catch (error) {
    logger.error('Get visitor error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// POST /api/v1/visitors - Create visitor (guard or resident)
router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      society_id,
      flat_id,
      visitor_type,
      visitor_name,
      visitor_phone,
      visitor_email,
      visitor_photo,
      vehicle_number,
      purpose,
      whom_to_meet,
      number_of_persons,
      delivery_item,
      delivery_company,
      expected_exit_time
    } = req.body;

    // Determine target flat
    let targetFlatId = flat_id;
    let targetFlat = null;
    
    if (!targetFlatId && req.user.flat_id) {
      // Resident creating visitor pass for themselves
      targetFlatId = req.user.flat_id;
    }
    
    if (!targetFlatId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Flat ID is required'
      });
    }

    targetFlat = await Flat.findByPk(targetFlatId, {
      include: [{ model: Block, as: 'block' }]
    });
    
    if (!targetFlat) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Flat not found'
      });
    }

    // Upload visitor photo if provided
    let photoUrl = null;
    if (visitor_photo && visitor_photo.startsWith('data:')) {
      try {
        const uploaded = await uploadBase64Image(visitor_photo, 'visitors');
        photoUrl = uploaded.url;
      } catch (uploadError) {
        logger.error('Photo upload error:', uploadError);
      }
    }

    // Generate visitor number
    const visitorNumber = generateVisitorNumber();

    // Create visitor
    const visitor = await Visitor.create({
      society_id: society_id || targetFlat.society_id,
      flat_id: targetFlatId,
      visitor_number: visitorNumber,
      visitor_type: visitor_type || 'GUEST',
      visitor_name,
      visitor_phone,
      visitor_email,
      visitor_photo: photoUrl,
      vehicle_number,
      purpose,
      whom_to_meet: whom_to_meet || targetFlat.owner_name,
      flat_number: targetFlat.flat_number,
      entry_time: new Date(),
      expected_exit_time,
      number_of_persons: number_of_persons || 1,
      delivery_item,
      delivery_company,
      status: 'PENDING',
      entry_by: req.user.id
    });

    // Generate QR code
    const qrData = JSON.stringify({
      id: visitor.id,
      number: visitorNumber,
      flat: targetFlat.flat_number,
      name: visitor_name
    });
    
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    await visitor.update({ qr_code: qrCodeUrl });

    // Get flat owner for notification
    const owner = await User.findOne({
      where: { 
        flat_id: targetFlatId,
        user_type: { [Op.in]: ['OWNER', 'RESIDENT'] },
        is_active: true
      }
    });

    // Send notification to resident
    if (owner && owner.fcm_token) {
      try {
        await sendNotification(
          owner.fcm_token,
          visitor_type === 'DELIVERY' ? '📦 Delivery Arrived' : '👋 Visitor Arrived',
          `${visitor_name} is here to meet you. Purpose: ${purpose}`,
          { visitor_id: visitor.id, type: 'visitor' }
        );
      } catch (notifError) {
        logger.error('Notification error:', notifError);
      }
    }

    logger.info(`Visitor created: ${visitorNumber}`);

    res.status(201).json({
      message: 'Visitor entry recorded',
      visitor
    });
  } catch (error) {
    logger.error('Create visitor error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/visitors/:id/approve - Approve/reject visitor
router.put('/:id/approve', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // status: APPROVED, REJECTED
    
    const visitor = await Visitor.findByPk(id);
    if (!visitor) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Visitor not found'
      });
    }

    // Only flat owner/resident can approve
    if (req.user.flat_id !== visitor.flat_id && 
        !['ADMIN', 'CHAIRMAN', 'SECRETARY'].includes(req.user.user_type)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only flat resident can approve visitors'
      });
    }

    await visitor.update({
      status,
      approved_by: req.user.id,
      approval_time: new Date(),
      remarks: remarks || visitor.remarks
    });

    // Notify guard
    const entryGuard = await User.findByPk(visitor.entry_by);
    if (entryGuard && entryGuard.fcm_token) {
      try {
        await sendNotification(
          entryGuard.fcm_token,
          status === 'APPROVED' ? '✅ Visitor Approved' : '❌ Visitor Rejected',
          `${visitor.visitor_name} - ${status}`,
          { visitor_id: visitor.id, type: 'visitor' }
        );
      } catch (notifError) {
        logger.error('Notification error:', notifError);
      }
    }

    res.json({
      message: `Visitor ${status.toLowerCase()}`,
      visitor
    });
  } catch (error) {
    logger.error('Approve visitor error:', error);
    res.status(500).json({
      error: 'Approval Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/visitors/:id/checkout - Visitor checkout
router.put('/:id/checkout', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const visitor = await Visitor.findByPk(id);
    if (!visitor) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Visitor not found'
      });
    }

    await visitor.update({
      status: 'DEPARTED',
      exit_time: new Date(),
      exit_by: req.user.id
    });

    res.json({
      message: 'Visitor checkout recorded',
      visitor
    });
  } catch (error) {
    logger.error('Checkout error:', error);
    res.status(500).json({
      error: 'Checkout Failed',
      message: error.message
    });
  }
});

// GET /api/v1/visitors/pending - Get pending approvals for resident
router.get('/pending/approvals', authenticate, async (req, res) => {
  try {
    if (!req.user.flat_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No flat associated with user'
      });
    }

    const visitors = await Visitor.findAll({
      where: {
        flat_id: req.user.flat_id,
        status: 'PENDING'
      },
      order: [['entry_time', 'DESC']]
    });

    res.json({ visitors });
  } catch (error) {
    logger.error('Get pending approvals error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

module.exports = router;
