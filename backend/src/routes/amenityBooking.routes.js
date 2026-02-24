/**
 * Amenity Booking Routes
 * Amenity booking operations
 */

const express = require('express');
const router = express.Router();
const { AmenityBooking, Amenity, Flat, Block, User, Payment } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Generate booking number
const generateBookingNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `AMB-${timestamp}${random}`;
};

// GET /api/v1/bookings - List bookings
router.get('/', authenticate, async (req, res) => {
  try {
    const { society_id, amenity_id, flat_id, status, booking_date, limit = 50, offset = 0 } = req.query;
    
    const where = {};
    
    if (society_id) {
      where.society_id = society_id;
    } else if (req.user.society_id) {
      where.society_id = req.user.society_id;
    }
    
    if (amenity_id) {
      where.amenity_id = amenity_id;
    }
    
    if (flat_id) {
      where.flat_id = flat_id;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (booking_date) {
      where.booking_date = booking_date;
    }

    // For residents, only show their bookings
    if (req.user.flat_id && !flat_id) {
      where.user_id = req.user.id;
    }

    const bookings = await AmenityBooking.findAndCountAll({
      where,
      include: [
        { model: Amenity, as: 'amenity', attributes: ['id', 'name', 'amenity_type'] },
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] },
        { model: User, as: 'booker', attributes: ['id', 'first_name', 'last_name', 'phone'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['booking_date', 'DESC'], ['start_time', 'ASC']]
    });

    res.json({
      bookings: bookings.rows,
      total: bookings.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Get bookings error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/bookings/:id - Get booking details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await AmenityBooking.findByPk(id, {
      include: [
        { model: Amenity, as: 'amenity' },
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] },
        { model: User, as: 'booker', attributes: ['id', 'first_name', 'last_name', 'phone', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Booking not found'
      });
    }

    res.json({ booking });
  } catch (error) {
    logger.error('Get booking error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// POST /api/v1/bookings - Create booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      society_id,
      amenity_id,
      booking_date,
      start_time,
      end_time,
      purpose,
      number_of_guests,
      notes
    } = req.body;

    // Validate amenity
    const amenity = await Amenity.findByPk(amenity_id);
    if (!amenity) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Amenity not found'
      });
    }

    // Check if amenity is active
    if (!amenity.is_active) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Amenity is not available'
      });
    }

    // Get user's flat
    const flatId = req.user.flat_id;
    if (!flatId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No flat associated with user'
      });
    }

    // Calculate hours
    const start = new Date(`2000-01-01T${start_time}`);
    const end = new Date(`2000-01-01T${end_time}`);
    const hours = (end - start) / (1000 * 60 * 60);

    if (hours < amenity.min_booking_hours) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Minimum booking is ${amenity.min_booking_hours} hour(s)`
      });
    }

    if (hours > amenity.max_booking_hours) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Maximum booking is ${amenity.max_booking_hours} hour(s)`
      });
    }

    // Check for conflicting bookings
    const conflict = await AmenityBooking.findOne({
      where: {
        amenity_id,
        booking_date,
        status: { [Op.notIn]: ['REJECTED', 'CANCELLED'] },
        [Op.or]: [
          {
            start_time: { [Op.between]: [start_time, end_time] }
          },
          {
            end_time: { [Op.between]: [start_time, end_time] }
          },
          {
            [Op.and]: [
              { start_time: { [Op.lte]: start_time } },
              { end_time: { [Op.gte]: end_time } }
            ]
          }
        ]
      }
    });

    if (conflict) {
      return res.status(400).json({
        error: 'Conflict',
        message: 'This time slot is already booked'
      });
    }

    // Check advance booking limit
    const today = new Date();
    const bookingDate = new Date(booking_date);
    const daysDiff = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > amenity.max_advance_days) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Can only book ${amenity.max_advance_days} days in advance`
      });
    }

    // Calculate charges
    const charge = hours * parseFloat(amenity.booking_charge);
    const securityDeposit = parseFloat(amenity.security_deposit);
    const totalAmount = charge + securityDeposit;

    // Determine status
    const status = amenity.requires_approval ? 'PENDING' : 'APPROVED';

    // Create booking
    const booking = await AmenityBooking.create({
      society_id: society_id || req.user.society_id,
      amenity_id,
      flat_id: flatId,
      user_id: req.user.id,
      booking_number: generateBookingNumber(),
      booking_date,
      start_time,
      end_time,
      total_hours: Math.ceil(hours),
      charge,
      security_deposit: securityDeposit,
      total_amount: totalAmount,
      status,
      purpose,
      number_of_guests: number_of_guests || 1,
      notes
    });

    logger.info(`Booking created: ${booking.booking_number}`);

    res.status(201).json({
      message: status === 'APPROVED' ? 'Booking confirmed' : 'Booking request submitted',
      booking
    });
  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/bookings/:id/approve - Approve/reject booking
router.put('/:id/approve', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    
    const booking = await AmenityBooking.findByPk(id);
    if (!booking) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Booking not found'
      });
    }

    if (!['ADMIN', 'CHAIRMAN', 'SECRETARY'].includes(req.user.user_type)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can approve bookings'
      });
    }

    await booking.update({
      status,
      approved_by: req.user.id,
      approval_date: new Date(),
      rejection_reason: status === 'REJECTED' ? rejection_reason : null
    });

    // Notify booker
    const booker = await User.findByPk(booking.user_id);
    if (booker && booker.fcm_token) {
      // Send notification logic would go here
    }

    res.json({
      message: `Booking ${status.toLowerCase()}`,
      booking
    });
  } catch (error) {
    logger.error('Approve booking error:', error);
    res.status(500).json({
      error: 'Approval Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/bookings/:id/cancel - Cancel booking
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;
    
    const booking = await AmenityBooking.findByPk(id);
    if (!booking) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Booking not found'
      });
    }

    // Only booker or admin can cancel
    if (booking.user_id !== req.user.id && 
        !['ADMIN', 'CHAIRMAN', 'SECRETARY'].includes(req.user.user_type)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only booker or admin can cancel'
      });
    }

    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot cancel this booking'
      });
    }

    await booking.update({
      status: 'CANCELLED',
      cancellation_reason
    });

    res.json({
      message: 'Booking cancelled',
      booking
    });
  } catch (error) {
    logger.error('Cancel booking error:', error);
    res.status(500).json({
      error: 'Cancellation Failed',
      message: error.message
    });
  }
});

module.exports = router;
