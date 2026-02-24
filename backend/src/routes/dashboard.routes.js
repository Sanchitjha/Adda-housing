/**
 * Dashboard Routes
 * Analytics and dashboard data
 */

const express = require('express');
const router = express.Router();
const { User, Flat, Bill, Payment, Complaint, Visitor, Notice, Staff, AmenityBooking, Block } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// GET /api/v1/dashboard/summary - Get dashboard summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const { society_id } = req.query;
    const targetSocietyId = society_id || req.user.society_id;

    if (!targetSocietyId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Society ID is required'
      });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get counts
    const [
      totalFlats,
      occupiedFlats,
      totalResidents,
      totalStaff,
      openComplaints,
      pendingBills,
      pendingPayments,
      todayVisitors,
      activeNotices,
      pendingBookings
    ] = await Promise.all([
      Flat.count({ where: { society_id: targetSocietyId } }),
      Flat.count({ where: { society_id: targetSocietyId, is_occupied: true } }),
      User.count({ where: { society_id: targetSocietyId, is_active: true } }),
      Staff.count({ where: { society_id: targetSocietyId, is_active: true } }),
      Complaint.count({ where: { society_id: targetSocietyId, status: { [Op.in]: ['OPEN', 'IN_PROGRESS'] } } }),
      Bill.count({ where: { society_id: targetSocietyId, status: { [Op.in]: ['PENDING', 'OVERDUE'] } } }),
      AmenityBooking.count({ where: { society_id: targetSocietyId, status: 'PENDING' } }),
      Visitor.count({ 
        where: { 
          society_id: targetSocietyId,
          entry_time: { [Op.gte]: new Date(today.setHours(0, 0, 0, 0)) }
        }
      }),
      Notice.count({ where: { society_id: targetSocietyId, is_published: true } }),
      AmenityBooking.count({ where: { society_id: targetSocietyId, status: 'PENDING' } })
    ]);

    // Get financial data
    const [monthlyIncome, yearlyIncome, pendingAmount] = await Promise.all([
      Payment.sum('amount', {
        where: {
          society_id: targetSocietyId,
          status: 'COMPLETED',
          payment_date: { [Op.gte]: startOfMonth }
        }
      }),
      Payment.sum('amount', {
        where: {
          society_id: targetSocietyId,
          status: 'COMPLETED',
          payment_date: { [Op.gte]: startOfYear }
        }
      }),
      Bill.sum('total_amount', {
        where: {
          society_id: targetSocietyId,
          status: { [Op.in]: ['PENDING', 'OVERDUE'] }
        }
      })
    ]);

    res.json({
      summary: {
        total_flats: totalFlats,
        occupied_flats: occupiedFlats,
        vacant_flats: totalFlats - occupiedFlats,
        total_residents: totalResidents,
        total_staff: totalStaff,
        open_complaints: openComplaints,
        pending_bills: pendingBills,
        pending_bookings: pendingBookings,
        today_visitors: todayVisitors,
        active_notices: activeNotices,
        monthly_income: monthlyIncome || 0,
        yearly_income: yearlyIncome || 0,
        pending_amount: pendingAmount || 0,
        collection_percentage: pendingAmount > 0 
          ? ((yearlyIncome || 0) / ((yearlyIncome || 0) + pendingAmount) * 100).toFixed(2)
          : 100
      }
    });
  } catch (error) {
    logger.error('Get dashboard summary error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/dashboard/charts - Get chart data
router.get('/charts', authenticate, async (req, res) => {
  try {
    const { society_id, period = 'month' } = req.query;
    const targetSocietyId = society_id || req.user.society_id;

    if (!targetSocietyId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Society ID is required'
      });
    }

    // Generate date labels based on period
    const labels = [];
    const now = new Date();
    let dateFormat, startDate;

    if (period === 'year') {
      dateFormat = 'MMM';
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(d.toLocaleString('default', { month: 'short' }));
      }
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      dateFormat = 'DD';
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        labels.push(d.getDate().toString());
      }
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get payment data
    const payments = await Payment.findAll({
      where: {
        society_id: targetSocietyId,
        status: 'COMPLETED',
        payment_date: { [Op.gte]: startDate }
      },
      attributes: ['payment_date', 'amount'],
      order: [['payment_date', 'ASC']]
    });

    // Group by date
    const incomeData = new Array(labels.length).fill(0);
    payments.forEach(payment => {
      const date = new Date(payment.payment_date);
      let index;
      if (period === 'year') {
        index = date.getMonth();
      } else {
        index = Math.min(29, Math.floor((now - date) / (24 * 60 * 60 * 1000)));
      }
      if (index >= 0 && index < labels.length) {
        incomeData[index] += parseFloat(payment.amount);
      }
    });

    // Get complaint data
    const complaints = await Complaint.findAll({
      where: {
        society_id: targetSocietyId,
        created_at: { [Op.gte]: startDate }
      },
      attributes: ['created_at', 'status']
    });

    const complaintData = new Array(labels.length).fill(0);
    complaints.forEach(complaint => {
      const date = new Date(complaint.created_at);
      let index;
      if (period === 'year') {
        index = date.getMonth();
      } else {
        index = Math.min(29, Math.floor((now - date) / (24 * 60 * 60 * 1000)));
      }
      if (index >= 0 && index < labels.length) {
        complaintData[index]++;
      }
    });

    // Get visitor data
    const visitors = await Visitor.findAll({
      where: {
        society_id: targetSocietyId,
        entry_time: { [Op.gte]: startDate }
      },
      attributes: ['entry_time']
    });

    const visitorData = new Array(labels.length).fill(0);
    visitors.forEach(visitor => {
      const date = new Date(visitor.entry_time);
      let index;
      if (period === 'year') {
        index = date.getMonth();
      } else {
        index = Math.min(29, Math.floor((now - date) / (24 * 60 * 60 * 1000)));
      }
      if (index >= 0 && index < labels.length) {
        visitorData[index]++;
      }
    });

    res.json({
      charts: {
        labels,
        income: incomeData,
        complaints: complaintData,
        visitors: visitorData
      }
    });
  } catch (error) {
    logger.error('Get dashboard charts error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/dashboard/recent - Get recent activities
router.get('/recent', authenticate, async (req, res) => {
  try {
    const { society_id } = req.query;
    const targetSocietyId = society_id || req.user.society_id;

    if (!targetSocietyId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Society ID is required'
      });
    }

    // Get recent payments
    const recentPayments = await Payment.findAll({
      where: { society_id: targetSocietyId },
      include: [
        { model: Flat, as: 'flat', attributes: ['flat_number'] },
        { model: User, as: 'payer', attributes: ['first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Get recent complaints
    const recentComplaints = await Complaint.findAll({
      where: { society_id: targetSocietyId },
      include: [
        { model: Flat, as: 'flat', attributes: ['flat_number'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Get recent visitors
    const recentVisitors = await Visitor.findAll({
      where: { society_id: targetSocietyId },
      include: [
        { model: Flat, as: 'flat', attributes: ['flat_number'] }
      ],
      order: [['entry_time', 'DESC']],
      limit: 5
    });

    res.json({
      recent: {
        payments: recentPayments,
        complaints: recentComplaints,
        visitors: recentVisitors
      }
    });
  } catch (error) {
    logger.error('Get recent activities error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

module.exports = router;
