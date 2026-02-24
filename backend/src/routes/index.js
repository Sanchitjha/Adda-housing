/**
 * API Routes Index
 * All route definitions
 */

const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const societyRoutes = require('./society.routes');
const blockRoutes = require('./block.routes');
const flatRoutes = require('./flat.routes');
const userRoutes = require('./user.routes');
const billRoutes = require('./bill.routes');
const paymentRoutes = require('./payment.routes');
const complaintRoutes = require('./complaint.routes');
const noticeRoutes = require('./notice.routes');
const visitorRoutes = require('./visitor.routes');
const staffRoutes = require('./staff.routes');
const amenityRoutes = require('./amenity.routes');
const amenityBookingRoutes = require('./amenityBooking.routes');
const chatRoutes = require('./chat.routes');
const reportRoutes = require('./report.routes');
const dashboardRoutes = require('./dashboard.routes');

// Public routes
router.use('/auth', authRoutes);
router.use('/societies', societyRoutes);

// Protected routes
router.use('/blocks', blockRoutes);
router.use('/flats', flatRoutes);
router.use('/users', userRoutes);
router.use('/bills', billRoutes);
router.use('/payments', paymentRoutes);
router.use('/complaints', complaintRoutes);
router.use('/notices', noticeRoutes);
router.use('/visitors', visitorRoutes);
router.use('/staff', staffRoutes);
router.use('/amenities', amenityRoutes);
router.use('/bookings', amenityBookingRoutes);
router.use('/chat', chatRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
