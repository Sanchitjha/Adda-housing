/**
 * Complaint Routes
 * Complaint submission and management
 */

const express = require('express');
const router = express.Router();
const { Complaint, Flat, Block, Society, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { uploadBase64Image } = require('../config/s3');
const { sendNotification } = require('../config/firebase');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Generate complaint number
const generateComplaintNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `CMP-${timestamp}${random}`;
};

// GET /api/v1/complaints - List complaints
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      society_id, 
      flat_id, 
      category,
      status,
      priority,
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
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }

    // For residents, only show their complaints
    if (req.user.flat_id && !flat_id) {
      where.user_id = req.user.id;
    }

    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at[Op.gte] = new Date(from_date);
      if (to_date) where.created_at[Op.lte] = new Date(to_date);
    }

    const complaints = await Complaint.findAndCountAll({
      where,
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] },
        { model: User, as: 'complainant', attributes: ['id', 'first_name', 'last_name', 'phone'] },
        { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      complaints: complaints.rows,
      total: complaints.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Get complaints error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/complaints/:id - Get complaint details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const complaint = await Complaint.findByPk(id, {
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] },
        { model: Society, as: 'society', attributes: ['id', 'name'] },
        { model: User, as: 'complainant', attributes: ['id', 'first_name', 'last_name', 'phone', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'phone'] }
      ]
    });

    if (!complaint) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Complaint not found'
      });
    }

    // Check access
    if (req.user.flat_id && complaint.user_id !== req.user.id && 
        !['ADMIN', 'CHAIRMAN', 'SECRETARY'].includes(req.user.user_type)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied'
      });
    }

    res.json({ complaint });
  } catch (error) {
    logger.error('Get complaint error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// POST /api/v1/complaints - Create complaint
router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      flat_id,
      category,
      priority,
      title,
      description,
      images,
      location,
      is_emergency
    } = req.body;

    // Use user's flat if not specified
    const targetFlatId = flat_id || req.user.flat_id;
    
    if (!targetFlatId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Flat ID is required'
      });
    }

    const flat = await Flat.findByPk(targetFlatId);
    if (!flat) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Flat not found'
      });
    }

    // Upload images if provided
    let uploadedImages = [];
    if (images && images.length > 0) {
      for (const image of images) {
        if (image.startsWith('data:')) {
          try {
            const uploaded = await uploadBase64Image(image, 'complaints');
            uploadedImages.push(uploaded.url);
          } catch (uploadError) {
            logger.error('Image upload error:', uploadError);
          }
        }
      }
    }

    // Create complaint
    const complaint = await Complaint.create({
      society_id: flat.society_id,
      flat_id: targetFlatId,
      user_id: req.user.id,
      complaint_number: generateComplaintNumber(),
      category,
      priority: priority || 'MEDIUM',
      title,
      description,
      images: uploadedImages,
      location,
      is_emergency: is_emergency || false
    });

    // Notify admins
    const admins = await User.findAll({
      where: {
        society_id: flat.society_id,
        user_type: { [Op.in]: ['ADMIN', 'CHAIRMAN', 'SECRETARY'] },
        is_active: true,
        fcm_token: { [Op.ne]: null }
      }
    });

    for (const admin of admins) {
      if (admin.fcm_token) {
        try {
          await sendNotification(
            admin.fcm_token,
            is_emergency ? '🚨 Emergency Complaint' : 'New Complaint',
            `${title} - ${category}`,
            { complaint_id: complaint.id, type: 'complaint' }
          );
        } catch (notifError) {
          logger.error('Notification error:', notifError);
        }
      }
    }

    logger.info(`Complaint created: ${complaint.complaint_number}`);

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    logger.error('Create complaint error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/complaints/:id - Update complaint
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title,
      description,
      images,
      location
    } = req.body;
    
    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Complaint not found'
      });
    }

    // Only complainant can update before assignment
    if (complaint.user_id !== req.user.id && 
        !['ADMIN', 'CHAIRMAN', 'SECRETARY'].includes(req.user.user_type)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied'
      });
    }

    // Upload new images if provided
    let uploadedImages = complaint.images || [];
    if (images && images.length > 0) {
      for (const image of images) {
        if (image.startsWith('data:')) {
          try {
            const uploaded = await uploadBase64Image(image, 'complaints');
            uploadedImages.push(uploaded.url);
          } catch (uploadError) {
            logger.error('Image upload error:', uploadError);
          }
        }
      }
    }

    await complaint.update({
      title: title || complaint.title,
      description: description !== undefined ? description : complaint.description,
      images: uploadedImages,
      location: location !== undefined ? location : complaint.location
    });

    res.json({
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    logger.error('Update complaint error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/complaints/:id/status - Update complaint status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_note, resolution_images, assigned_to } = req.body;
    
    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Complaint not found'
      });
    }

    // Only admins can change status
    if (!['ADMIN', 'CHAIRMAN', 'SECRETARY'].includes(req.user.user_type)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can update complaint status'
      });
    }

    // Upload resolution images if provided
    let uploadedImages = complaint.resolution_images || [];
    if (resolution_images && resolution_images.length > 0) {
      for (const image of resolution_images) {
        if (image.startsWith('data:')) {
          try {
            const uploaded = await uploadBase64Image(image, 'complaints/resolution');
            uploadedImages.push(uploaded.url);
          } catch (uploadError) {
            logger.error('Image upload error:', uploadError);
          }
        }
      }
    }

    const updateData = {
      status,
      resolution_note: resolution_note !== undefined ? resolution_note : complaint.resolution_note,
      resolution_images: uploadedImages
    };

    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolution_date = new Date();
    }

    if (assigned_to) {
      updateData.assigned_to = assigned_to;
      updateData.assigned_date = new Date();
    }

    await complaint.update(updateData);

    // Notify complainant
    const complainant = await User.findByPk(complaint.user_id);
    if (complainant && complainant.fcm_token) {
      try {
        await sendNotification(
          complainant.fcm_token,
          'Complaint Update',
          `Your complaint "${complaint.title}" status: ${status}`,
          { complaint_id: complaint.id, type: 'complaint' }
        );
      } catch (notifError) {
        logger.error('Notification error:', notifError);
      }
    }

    res.json({
      message: 'Complaint status updated',
      complaint
    });
  } catch (error) {
    logger.error('Update complaint status error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: error.message
    });
  }
});

// POST /api/v1/complaints/:id/feedback - Submit feedback
router.post('/:id/feedback', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback_rating, feedback_comment } = req.body;
    
    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Complaint not found'
      });
    }

    // Only complainant can give feedback
    if (complaint.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only complainant can submit feedback'
      });
    }

    // Can only give feedback for resolved complaints
    if (!['RESOLVED', 'CLOSED'].includes(complaint.status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Can only give feedback for resolved complaints'
      });
    }

    await complaint.update({
      feedback_rating,
      feedback_comment
    });

    res.json({
      message: 'Feedback submitted successfully',
      complaint
    });
  } catch (error) {
    logger.error('Submit feedback error:', error);
    res.status(500).json({
      error: 'Submission Failed',
      message: error.message
    });
  }
});

module.exports = router;
