/**
 * Payment Routes
 * Payment processing with Razorpay integration
 */

const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { Payment, Bill, Flat, Block, Society, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const { sendNotification } = require('../config/firebase');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Generate payment number
const generatePaymentNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${timestamp}${random}`;
};

// Generate receipt number
const generateReceiptNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `RCP-${timestamp}`;
};

// GET /api/v1/payments - List payments
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      society_id, 
      flat_id, 
      bill_id,
      status, 
      payment_method,
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
    
    if (bill_id) {
      where.bill_id = bill_id;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (payment_method) {
      where.payment_method = payment_method;
    }
    
    if (from_date || to_date) {
      where.payment_date = {};
      if (from_date) where.payment_date[Op.gte] = new Date(from_date);
      if (to_date) where.payment_date[Op.lte] = new Date(to_date);
    }

    // For residents, only show their payments
    if (req.user.flat_id && !flat_id) {
      where.flat_id = req.user.flat_id;
    }

    const payments = await Payment.findAndCountAll({
      where,
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] },
        { model: Bill, as: 'bill', attributes: ['id', 'bill_number', 'bill_month', 'bill_year', 'total_amount'] },
        { model: User, as: 'payer', attributes: ['id', 'first_name', 'last_name', 'phone'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['payment_date', 'DESC']]
    });

    res.json({
      payments: payments.rows,
      total: payments.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Get payments error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/payments/:id - Get payment details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findByPk(id, {
      include: [
        { model: Flat, as: 'flat', include: [{ model: Block, as: 'block' }] },
        { model: Society, as: 'society', attributes: ['id', 'name', 'bank_name', 'bank_account_number', 'bank_ifsc'] },
        { model: Bill, as: 'bill' },
        { model: User, as: 'payer', attributes: ['id', 'first_name', 'last_name', 'phone', 'email'] },
        { model: User, as: 'collector', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Payment not found'
      });
    }

    res.json({ payment });
  } catch (error) {
    logger.error('Get payment error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// POST /api/v1/payments - Create payment (offline)
router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      flat_id,
      bill_id,
      amount,
      payment_method,
      payment_date,
      reference_number,
      cheque_number,
      bank_name,
      branch_name,
      payment_note
    } = req.body;

    // Verify flat exists
    const flat = await Flat.findByPk(flat_id);
    if (!flat) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Flat not found'
      });
    }

    // Verify bill if provided
    let bill = null;
    if (bill_id) {
      bill = await Bill.findByPk(bill_id);
      if (!bill) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Bill not found'
        });
      }
    }

    // Create payment
    const payment = await Payment.create({
      society_id: flat.society_id,
      flat_id,
      bill_id,
      user_id: req.user.id,
      payment_number: generatePaymentNumber(),
      amount,
      payment_method,
      payment_date: payment_date || new Date(),
      reference_number,
      cheque_number,
      bank_name,
      branch_name,
      payment_note,
      status: 'COMPLETED',
      receipt_number: generateReceiptNumber(),
      created_by: req.user.id
    });

    // Update bill if linked
    if (bill) {
      const newPaidAmount = parseFloat(bill.paid_amount) + parseFloat(amount);
      const billStatus = newPaidAmount >= parseFloat(bill.total_amount) ? 'PAID' : 'PARTIAL';
      
      await bill.update({
        paid_amount: newPaidAmount,
        status: billStatus,
        paid_date: new Date()
      });
    }

    logger.info(`Payment created: ${payment.payment_number}`);

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    logger.error('Create payment error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: error.message
    });
  }
});

// POST /api/v1/payments/razorpay/order - Create Razorpay order
router.post('/razorpay/order', authenticate, async (req, res) => {
  try {
    const { bill_id, amount } = req.body;

    if (!bill_id || !amount) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Bill ID and amount are required'
      });
    }

    // Verify bill
    const bill = await Bill.findByPk(bill_id, {
      include: [{ model: Flat, as: 'flat' }]
    });

    if (!bill) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Bill not found'
      });
    }

    // Verify access
    if (req.user.flat_id && bill.flat_id !== req.user.flat_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied'
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${bill.bill_number}`,
      notes: {
        bill_id: bill.id,
        flat_id: bill.flat_id,
        society_id: bill.society_id,
        user_id: req.user.id
      }
    };

    const order = await razorpay.orders.create(options);

    // Create pending payment record
    const payment = await Payment.create({
      society_id: bill.society_id,
      flat_id: bill.flat_id,
      bill_id: bill.id,
      user_id: req.user.id,
      payment_number: generatePaymentNumber(),
      amount,
      payment_method: 'RAZORPAY',
      razorpay_order_id: order.id,
      status: 'PENDING',
      payment_date: new Date()
    });

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      payment_id: payment.id
    });
  } catch (error) {
    logger.error('Create Razorpay order error:', error);
    res.status(500).json({
      error: 'Order Creation Failed',
      message: error.message
    });
  }
});

// POST /api/v1/payments/razorpay/verify - Verify Razorpay payment
router.post('/razorpay/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, payment_id } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Update payment status
      if (payment_id) {
        await Payment.update(
          { status: 'FAILED' },
          { where: { id: payment_id } }
        );
      }

      return res.status(400).json({
        error: 'Verification Failed',
        message: 'Invalid signature'
      });
    }

    // Get payment record
    const payment = await Payment.findOne({
      where: { razorpay_order_id }
    });

    if (payment) {
      // Update payment
      await payment.update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'COMPLETED',
        receipt_number: generateReceiptNumber(),
        payment_date: new Date()
      });

      // Update bill if linked
      if (payment.bill_id) {
        const bill = await Bill.findByPk(payment.bill_id);
        if (bill) {
          const newPaidAmount = parseFloat(bill.paid_amount) + parseFloat(payment.amount);
          const billStatus = newPaidAmount >= parseFloat(bill.total_amount) ? 'PAID' : 'PARTIAL';
          
          await bill.update({
            paid_amount: newPaidAmount,
            status: billStatus,
            paid_date: new Date()
          });
        }
      }

      // Send notification
      const user = await User.findByPk(payment.user_id);
      if (user && user.fcm_token) {
        try {
          await sendNotification(
            user.fcm_token,
            'Payment Successful',
            `Your payment of Rs. ${payment.amount} has been received. Receipt: ${payment.receipt_number}`,
            { payment_id: payment.id, type: 'payment' }
          );
        } catch (notifError) {
          logger.error('Notification error:', notifError);
        }
      }

      res.json({
        message: 'Payment verified successfully',
        payment
      });
    } else {
      res.status(404).json({
        error: 'Not Found',
        message: 'Payment record not found'
      });
    }
  } catch (error) {
    logger.error('Verify payment error:', error);
    res.status(500).json({
      error: 'Verification Failed',
      message: error.message
    });
  }
});

// POST /api/v1/payments/razorpay/webhook - Razorpay webhook
router.post('/razorpay/webhook', async (req, res) => {
  try {
    const { event, payload } = req.body;

    logger.info(`Razorpay webhook received: ${event}`);

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      
      // Find payment by razorpay_payment_id
      const payment = await Payment.findOne({
        where: { razorpay_payment_id: paymentEntity.id }
      });

      if (payment && payment.status === 'PENDING') {
        await payment.update({
          status: 'COMPLETED',
          receipt_number: generateReceiptNumber()
        });

        // Update bill
        if (payment.bill_id) {
          const bill = await Bill.findByPk(payment.bill_id);
          if (bill) {
            const newPaidAmount = parseFloat(bill.paid_amount) + parseFloat(payment.amount);
            const billStatus = newPaidAmount >= parseFloat(bill.total_amount) ? 'PAID' : 'PARTIAL';
            
            await bill.update({
              paid_amount: newPaidAmount,
              status: billStatus,
              paid_date: new Date()
            });
          }
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment.entity;
      
      await Payment.update(
        { status: 'FAILED' },
        { where: { razorpay_payment_id: paymentEntity.id } }
      );
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).json({
      error: 'Webhook Failed',
      message: error.message
    });
  }
});

module.exports = router;
