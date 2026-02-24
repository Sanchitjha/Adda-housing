/**
 * Chat Routes
 * Society chat functionality
 */

const express = require('express');
const router = express.Router();
const { ChatMessage, Society, User, Flat } = require('../models');
const { authenticate } = require('../middleware/auth');
const { uploadBase64Image } = require('../config/s3');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// GET /api/v1/chat/messages - Get chat messages
router.get('/messages', authenticate, async (req, res) => {
  try {
    const { society_id, limit = 50, offset = 0, before } = req.query;
    
    const targetSocietyId = society_id || req.user.society_id;
    
    if (!targetSocietyId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Society ID is required'
      });
    }

    const where = {
      society_id: targetSocietyId,
      is_deleted: false
    };

    if (before) {
      where.created_at = { [Op.lt]: new Date(before) };
    }

    const messages = await ChatMessage.findAll({
      where,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'first_name', 'last_name', 'profile_image', 'flat_id'] },
        { model: Flat, as: 'flat', attributes: ['id', 'flat_number'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({ messages: messages.reverse() });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// POST /api/v1/chat/messages - Send message
router.post('/messages', authenticate, async (req, res) => {
  try {
    const { society_id, message, message_type, attachment } = req.body;
    
    const targetSocietyId = society_id || req.user.society_id;
    
    if (!targetSocietyId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Society ID is required'
      });
    }

    if (!message && !attachment) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Message or attachment is required'
      });
    }

    // Upload attachment if provided
    let attachmentUrl = null;
    if (attachment && attachment.startsWith('data:')) {
      try {
        const uploaded = await uploadBase64Image(attachment, 'chat');
        attachmentUrl = uploaded.url;
      } catch (uploadError) {
        logger.error('Attachment upload error:', uploadError);
      }
    }

    // Determine message type
    const type = attachmentUrl ? 'IMAGE' : (message_type || 'TEXT');

    // Create message
    const chatMessage = await ChatMessage.create({
      society_id: targetSocietyId,
      user_id: req.user.id,
      flat_id: req.user.flat_id,
      message: message || '',
      message_type: type,
      attachment_url: attachmentUrl,
      is_announcement: false
    });

    // Get full message with sender info
    const fullMessage = await ChatMessage.findByPk(chatMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'first_name', 'last_name', 'profile_image'] },
        { model: Flat, as: 'flat', attributes: ['id', 'flat_number'] }
      ]
    });

    // Emit to socket
    const io = req.app.get('io');
    io.to(`society_${targetSocietyId}`).emit('new_message', fullMessage);

    res.status(201).json({
      message: 'Message sent',
      chatMessage: fullMessage
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      error: 'Send Failed',
      message: error.message
    });
  }
});

// POST /api/v1/chat/announcement - Send announcement (admin only)
router.post('/announcement', authenticate, async (req, res) => {
  try {
    const { society_id, message, attachment } = req.body;
    
    if (!['ADMIN', 'CHAIRMAN', 'SECRETARY'].includes(req.user.user_type)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can send announcements'
      });
    }

    const targetSocietyId = society_id || req.user.society_id;
    
    if (!targetSocietyId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Society ID is required'
      });
    }

    // Upload attachment if provided
    let attachmentUrl = null;
    if (attachment && attachment.startsWith('data:')) {
      try {
        const uploaded = await uploadBase64Image(attachment, 'chat');
        attachmentUrl = uploaded.url;
      } catch (uploadError) {
        logger.error('Attachment upload error:', uploadError);
      }
    }

    // Create announcement
    const chatMessage = await ChatMessage.create({
      society_id: targetSocietyId,
      user_id: req.user.id,
      flat_id: req.user.flat_id,
      message,
      message_type: 'ANNOUNCEMENT',
      attachment_url: attachmentUrl,
      is_announcement: true
    });

    // Get full message
    const fullMessage = await ChatMessage.findByPk(chatMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'first_name', 'last_name', 'profile_image'] }
      ]
    });

    // Emit to socket
    const io = req.app.get('io');
    io.to(`society_${targetSocietyId}`).emit('new_announcement', fullMessage);

    res.status(201).json({
      message: 'Announcement sent',
      chatMessage: fullMessage
    });
  } catch (error) {
    logger.error('Send announcement error:', error);
    res.status(500).json({
      error: 'Send Failed',
      message: error.message
    });
  }
});

// DELETE /api/v1/chat/messages/:id - Delete message
router.delete('/messages/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await ChatMessage.findByPk(id);
    if (!message) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Message not found'
      });
    }

    // Only sender or admin can delete
    if (message.user_id !== req.user.id && 
        !['ADMIN', 'CHAIRMAN', 'SECRETARY'].includes(req.user.user_type)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Cannot delete this message'
      });
    }

    await message.update({
      is_deleted: true,
      deleted_at: new Date(),
      message: 'This message has been deleted'
    });

    res.json({ message: 'Message deleted' });
  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: error.message
    });
  }
});

module.exports = router;
