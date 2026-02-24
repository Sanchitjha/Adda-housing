/**
 * Report Routes
 * Report generation (PDF, Excel)
 */

const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Bill, Payment, Complaint, Visitor, User, Flat, Block, Staff } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// GET /api/v1/reports/maintenance - Maintenance report
router.get('/maintenance', authenticate, isAdmin, async (req, res) => {
  try {
    const { society_id, from_date, to_date, format = 'excel' } = req.query;
    const targetSocietyId = society_id || req.user.society_id;

    const where = { society_id: targetSocietyId };
    
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at[Op.gte] = new Date(from_date);
      if (to_date) where.created_at[Op.lte] = new Date(to_date);
    }

    const bills = await Bill.findAll({
      where,
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] }
      ],
      order: [['created_at', 'DESC']]
    });

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=maintenance_report.pdf');
      
      doc.pipe(res);
      doc.fontSize(18).text('Maintenance Bill Report', { align: 'center' });
      doc.moveDown();
      
      bills.forEach(bill => {
        doc.fontSize(12).text(`Bill #: ${bill.bill_number} | Flat: ${bill.flat.flat_number} | Amount: Rs. ${bill.total_amount} | Status: ${bill.status}`);
        doc.fontSize(10).text(`Period: ${bill.bill_month}/${bill.bill_year} | Due Date: ${bill.due_date}`);
        doc.moveDown(0.5);
      });
      
      doc.end();
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Maintenance Bills');
      
      worksheet.columns = [
        { header: 'Bill Number', key: 'bill_number', width: 15 },
        { header: 'Flat', key: 'flat_number', width: 10 },
        { header: 'Block', key: 'block_name', width: 10 },
        { header: 'Month', key: 'bill_month', width: 8 },
        { header: 'Year', key: 'bill_year', width: 8 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Due Date', key: 'due_date', width: 12 },
        { header: 'Status', key: 'status', width: 10 }
      ];
      
      bills.forEach(bill => {
        worksheet.addRow({
          bill_number: bill.bill_number,
          flat_number: bill.flat.flat_number,
          block_name: bill.flat.block.name,
          bill_month: bill.bill_month,
          bill_year: bill.bill_year,
          amount: bill.total_amount,
          due_date: bill.due_date,
          status: bill.status
        });
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=maintenance_report.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    logger.error('Generate maintenance report error:', error);
    res.status(500).json({
      error: 'Report Generation Failed',
      message: error.message
    });
  }
});

// GET /api/v1/reports/payments - Payment report
router.get('/payments', authenticate, isAdmin, async (req, res) => {
  try {
    const { society_id, from_date, to_date, format = 'excel' } = req.query;
    const targetSocietyId = society_id || req.user.society_id;

    const where = { 
      society_id: targetSocietyId,
      status: 'COMPLETED'
    };
    
    if (from_date || to_date) {
      where.payment_date = {};
      if (from_date) where.payment_date[Op.gte] = new Date(from_date);
      if (to_date) where.payment_date[Op.lte] = new Date(to_date);
    }

    const payments = await Payment.findAll({
      where,
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] },
        { model: User, as: 'payer', attributes: ['first_name', 'last_name'] }
      ],
      order: [['payment_date', 'DESC']]
    });

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=payment_report.pdf');
      
      doc.pipe(res);
      doc.fontSize(18).text('Payment Collection Report', { align: 'center' });
      doc.moveDown();
      
      let totalAmount = 0;
      payments.forEach(payment => {
        totalAmount += parseFloat(payment.amount);
        doc.fontSize(12).text(`Receipt #: ${payment.receipt_number} | Flat: ${payment.flat.flat_number} | Amount: Rs. ${payment.amount} | Date: ${payment.payment_date}`);
        doc.fontSize(10).text(`Method: ${payment.payment_method} | Status: ${payment.status}`);
        doc.moveDown(0.5);
      });
      
      doc.moveDown();
      doc.fontSize(14).text(`Total Collection: Rs. ${totalAmount.toFixed(2)}`, { align: 'right' });
      
      doc.end();
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Payments');
      
      worksheet.columns = [
        { header: 'Receipt No', key: 'receipt_number', width: 15 },
        { header: 'Flat', key: 'flat_number', width: 10 },
        { header: 'Block', key: 'block_name', width: 10 },
        { header: 'Payer', key: 'payer_name', width: 20 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Date', key: 'payment_date', width: 12 },
        { header: 'Method', key: 'payment_method', width: 12 }
      ];
      
      payments.forEach(payment => {
        worksheet.addRow({
          receipt_number: payment.receipt_number,
          flat_number: payment.flat.flat_number,
          block_name: payment.flat.block.name,
          payer_name: `${payment.payer.first_name} ${payment.payer.last_name}`,
          amount: payment.amount,
          payment_date: payment.payment_date,
          payment_method: payment.payment_method
        });
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=payment_report.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    logger.error('Generate payment report error:', error);
    res.status(500).json({
      error: 'Report Generation Failed',
      message: error.message
    });
  }
});

// GET /api/v1/reports/visitors - Visitor report
router.get('/visitors', authenticate, isAdmin, async (req, res) => {
  try {
    const { society_id, from_date, to_date, format = 'excel' } = req.query;
    const targetSocietyId = society_id || req.user.society_id;

    const where = { society_id: targetSocietyId };
    
    if (from_date || to_date) {
      where.entry_time = {};
      if (from_date) where.entry_time[Op.gte] = new Date(from_date);
      if (to_date) where.entry_time[Op.lte] = new Date(to_date);
    }

    const visitors = await Visitor.findAll({
      where,
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] }
      ],
      order: [['entry_time', 'DESC']]
    });

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=visitor_report.pdf');
      
      doc.pipe(res);
      doc.fontSize(18).text('Visitor Log Report', { align: 'center' });
      doc.moveDown();
      
      visitors.forEach(visitor => {
        doc.fontSize(12).text(`Visitor: ${visitor.visitor_name} | Flat: ${visitor.flat.flat_number} | Type: ${visitor.visitor_type}`);
        doc.fontSize(10).text(`In: ${visitor.entry_time} | Out: ${visitor.exit_time || 'N/A'} | Status: ${visitor.status}`);
        doc.moveDown(0.5);
      });
      
      doc.end();
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Visitors');
      
      worksheet.columns = [
        { header: 'Visitor No', key: 'visitor_number', width: 15 },
        { header: 'Name', key: 'visitor_name', width: 20 },
        { header: 'Flat', key: 'flat_number', width: 10 },
        { header: 'Type', key: 'visitor_type', width: 12 },
        { header: 'Purpose', key: 'purpose', width: 20 },
        { header: 'Entry Time', key: 'entry_time', width: 18 },
        { header: 'Exit Time', key: 'exit_time', width: 18 },
        { header: 'Status', key: 'status', width: 10 }
      ];
      
      visitors.forEach(visitor => {
        worksheet.addRow({
          visitor_number: visitor.visitor_number,
          visitor_name: visitor.visitor_name,
          flat_number: visitor.flat.flat_number,
          visitor_type: visitor.visitor_type,
          purpose: visitor.purpose,
          entry_time: visitor.entry_time,
          exit_time: visitor.exit_time || 'N/A',
          status: visitor.status
        });
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=visitor_report.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    logger.error('Generate visitor report error:', error);
    res.status(500).json({
      error: 'Report Generation Failed',
      message: error.message
    });
  }
});

// GET /api/v1/reports/complaints - Complaint report
router.get('/complaints', authenticate, isAdmin, async (req, res) => {
  try {
    const { society_id, from_date, to_date, format = 'excel' } = req.query;
    const targetSocietyId = society_id || req.user.society_id;

    const where = { society_id: targetSocietyId };
    
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at[Op.gte] = new Date(from_date);
      if (to_date) where.created_at[Op.lte] = new Date(to_date);
    }

    const complaints = await Complaint.findAll({
      where,
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] }
      ],
      order: [['created_at', 'DESC']]
    });

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=complaint_report.pdf');
      
      doc.pipe(res);
      doc.fontSize(18).text('Complaint Report', { align: 'center' });
      doc.moveDown();
      
      complaints.forEach(complaint => {
        doc.fontSize(12).text(`Complaint #: ${complaint.complaint_number} | Flat: ${complaint.flat.flat_number} | Category: ${complaint.category}`);
        doc.fontSize(10).text(`Status: ${complaint.status} | Priority: ${complaint.priority} | Date: ${complaint.created_at}`);
        doc.moveDown(0.5);
      });
      
      doc.end();
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Complaints');
      
      worksheet.columns = [
        { header: 'Complaint No', key: 'complaint_number', width: 15 },
        { header: 'Flat', key: 'flat_number', width: 10 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Priority', key: 'priority', width: 10 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Date', key: 'created_at', width: 15 }
      ];
      
      complaints.forEach(complaint => {
        worksheet.addRow({
          complaint_number: complaint.complaint_number,
          flat_number: complaint.flat.flat_number,
          category: complaint.category,
          title: complaint.title,
          priority: complaint.priority,
          status: complaint.status,
          created_at: complaint.created_at
        });
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=complaint_report.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    logger.error('Generate complaint report error:', error);
    res.status(500).json({
      error: 'Report Generation Failed',
      message: error.message
    });
  }
});

module.exports = router;
