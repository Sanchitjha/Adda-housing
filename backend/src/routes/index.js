/**
 * Routes Index
 * Main API routes configuration
 */

const express = require('express');
const router = express.Router();

// Import route modules
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
const dashboardRoutes = require('./dashboard.routes');
const reportRoutes = require('./report.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/societies', societyRoutes);
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
router.use('/amenity-bookings', amenityBookingRoutes);
router.use('/chat', chatRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

// 404 handler
router.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = router;
