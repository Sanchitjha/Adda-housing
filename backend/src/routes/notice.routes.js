/**
 * Notice Routes
 * Society notices and announcements management
 */

const express = require('express');
const router = express.Router();
const { Notice, Society, User, Block } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { uploadBase64Image } = require('../config/s3');
const { sendTopicNotification } = require('../config/firebase');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// GET /api/v1/notices - List notices
router.get('/', authenticate, async (req, res) => {
  try {
    const { society_id, notice_type, is_published, target_audience, limit = 20, offset = 0 } = req.query;
    
    const where = {};
    
    if (society_id) {
      where.society_id = society_id;
    } else if (req.user.society_id) {
      where.society_id = req.user.society_id;
    }
    
    if (notice_type) {
      where.notice_type = notice_type;
    }
    
    if (is_published !== undefined) {
      where.is_published = is_published === 'true';
    } else {
      // Default to published only for non-admins
      if (!['ADMIN', 'CHAIRMAN', 'SECRETARY'].includes(req.user.user_type)) {
        where.is_published = true;
      }
    }
    
    if (target_audience) {
      where.target_audience = target_audience;
    }

    const notices = await Notice.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'first_name', 'last_name'] },
        { model: Block, as: 'targetBlock', attributes: ['id', 'name'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['publish_date', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({
      notices: notices.rows,
      total: notices.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Get notices error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/notices/:id - Get notice details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notice = await Notice.findByPk(id, {
      include: [
        { model: Society, as: 'society', attributes: ['id', 'name'] },
        { model: User, as: 'author', attributes: ['id', 'first_name', 'last_name'] },
        { model: Block, as: 'targetBlock', attributes: ['id', 'name'] }
      ]
    });

    if (!notice) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Notice not found'
      });
    }

    // Increment view count
    await notice.increment('view_count');

    res.json({ notice });
  } catch (error) {
    logger.error('Get notice error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// POST /api/v1/notices - Create notice
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { 
      society_id,
      title,
      content,
      notice_type,
      priority,
      attachment,
      publish_date,
      expiry_date,
      target_audience,
      target_block_id
    } = req.body;

    const targetSocietyId = society_id || req.user.society_id;
    
    if (!targetSocietyId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Society ID is required'
      });
    }

    // Upload attachment if provided
    let attachmentUrl = null;
    let attachmentName = null;
    if (attachment && attachment.startsWith('data:')) {
      try {
        const uploaded = await uploadBase64Image(attachment, 'notices/attachments');
        attachmentUrl = uploaded.url;
        attachmentName = 'attachment';
      } catch (uploadError) {
        logger.error('Attachment upload error:', uploadError);
      }
    }

    // Create notice
    const notice = await Notice.create({
      society_id: targetSocietyId,
      created_by: req.user.id,
      title,
      content,
      notice_type: notice_type || 'GENERAL',
      priority: priority || 'NORMAL',
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
      publish_date: publish_date || new Date(),
      expiry_date,
      target_audience: target_audience || 'ALL',
      target_block_id
    });

    // Send push notification
    try {
      await sendTopicNotification(
        `society_${targetSocietyId}`,
        notice_type === 'EMERGENCY' ? '🚨 Emergency Notice' : 'New Notice',
        title,
        { notice_id: notice.id, type: 'notice' }
      );
    } catch (notifError) {
      logger.error('Notification error:', notifError);
    }

    logger.info(`Notice created: ${notice.id}`);

    res.status(201).json({
      message: 'Notice created successfully',
      notice
    });
  } catch (error) {
    logger.error('Create notice error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/notices/:id - Update notice
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title,
      content,
      notice_type,
      priority,
      attachment,
      publish_date,
      expiry_date,
      target_audience,
      target_block_id,
      is_published
    } = req.body;
    
    const notice = await Notice.findByPk(id);
    if (!notice) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Notice not found'
      });
    }

    // Upload new attachment if provided
    let attachmentUrl = notice.attachment_url;
    if (attachment && attachment.startsWith('data:')) {
      try {
        const uploaded = await uploadBase64Image(attachment, 'notices/attachments');
        attachmentUrl = uploaded.url;
      } catch (uploadError) {
        logger.error('Attachment upload error:', uploadError);
      }
    }

    await notice.update({
      title: title || notice.title,
      content: content !== undefined ? content : notice.content,
      notice_type: notice_type || notice.notice_type,
      priority: priority || notice.priority,
      attachment_url: attachmentUrl,
      publish_date: publish_date || notice.publish_date,
      expiry_date: expiry_date !== undefined ? expiry_date : notice.expiry_date,
      target_audience: target_audience || notice.target_audience,
      target_block_id: target_block_id !== undefined ? target_block_id : notice.target_block_id,
      is_published: is_published !== undefined ? is_published : notice.is_published
    });

    res.json({
      message: 'Notice updated successfully',
      notice
    });
  } catch (error) {
    logger.error('Update notice error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: error.message
    });
  }
});

// DELETE /api/v1/notices/:id - Delete notice
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notice = await Notice.findByPk(id);
    if (!notice) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Notice not found'
      });
    }

    await notice.destroy();

    res.json({
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    logger.error('Delete notice error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: error.message
    });
  }
});

module.exports = router;
