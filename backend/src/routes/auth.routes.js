/**
 * Authentication Routes
 * User registration, login, OTP, and token refresh
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, Society, Flat, Role } = require('../models');
const { authenticate } = require('../middleware/auth');
const { uploadBase64Image } = require('../config/s3');
const { sendNotification } = require('../config/firebase');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );
  
  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      society_id,
      flat_id,
      user_type,
      profile_image
    } = req.body;

    // Check if phone already exists
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Registration Failed',
        message: 'Phone number already registered'
      });
    }

    // If email provided, check uniqueness
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          error: 'Registration Failed',
          message: 'Email already registered'
        });
      }
    }

    // Upload profile image if provided
    let profileImageUrl = null;
    if (profile_image) {
      try {
        const uploaded = await uploadBase64Image(profile_image, 'profiles');
        profileImageUrl = uploaded.url;
      } catch (uploadError) {
        logger.error('Profile image upload error:', uploadError);
      }
    }

    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      password,
      society_id,
      flat_id,
      user_type: user_type || 'RESIDENT',
      profile_image: profileImageUrl,
      is_verified: false
    });

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Get society details if available
    let society = null;
    if (user.society_id) {
      society = await Society.findByPk(user.society_id);
    }

    // Get flat details if available
    let flat = null;
    if (user.flat_id) {
      flat = await Flat.findByPk(user.flat_id, {
        include: [{ model: Block, as: 'block' }]
      });
    }

    res.status(201).json({
      message: 'Registration successful',
      user: user.toJSON(),
      society,
      flat,
      ...tokens
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration Failed',
      message: error.message
    });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password, fcm_token, device_id } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Phone and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Account is deactivated'
      });
    }

    // Update FCM token and device ID
    if (fcm_token || device_id) {
      await user.update({
        fcm_token: fcm_token || user.fcm_token,
        device_id: device_id || user.device_id,
        last_login: new Date()
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Get society details
    let society = null;
    if (user.society_id) {
      society = await Society.findByPk(user.society_id);
    }

    // Get flat details
    let flat = null;
    if (user.flat_id) {
      flat = await Flat.findByPk(user.flat_id, {
        include: [{ model: Block, as: 'block' }]
      });
    }

    // Get role details
    let role = null;
    if (user.role_id) {
      role = await Role.findByPk(user.role_id);
    }

    logger.info(`User ${user.id} logged in successfully`);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      society,
      flat,
      role,
      ...tokens
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Authentication Failed',
      message: error.message
    });
  }
});

// POST /api/v1/auth/otp/send
router.post('/otp/send', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Phone number is required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      // Generate random OTP for new user registration
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      return res.status(200).json({
        message: 'OTP sent successfully',
        // In production, send OTP via SMS
        // For development, return OTP
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        phone,
        expires_in: 600
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await user.update({
      otp,
      otp_expires_at: otpExpires
    });

    // In production, send OTP via SMS
    logger.info(`OTP sent to ${phone}: ${otp}`);

    res.status(200).json({
      message: 'OTP sent successfully',
      // In production, send OTP via SMS
      // For development, return OTP
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      phone,
      expires_in: 600
    });
  } catch (error) {
    logger.error('OTP send error:', error);
    res.status(500).json({
      error: 'OTP Failed',
      message: error.message
    });
  }
});

// POST /api/v1/auth/otp/verify
router.post('/otp/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Phone and OTP are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({
        error: 'Verification Failed',
        message: 'User not found'
      });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        error: 'Verification Failed',
        message: 'Invalid OTP'
      });
    }

    // Check OTP expiry
    if (new Date() > user.otp_expires_at) {
      return res.status(400).json({
        error: 'Verification Failed',
        message: 'OTP expired'
      });
    }

    // Verify user
    await user.update({
      is_verified: true,
      otp: null,
      otp_expires_at: null
    });

    // Generate tokens
    const tokens = generateTokens(user.id);

    res.json({
      message: 'Phone verified successfully',
      user: user.toJSON(),
      ...tokens
    });
  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(500).json({
      error: 'Verification Failed',
      message: error.message
    });
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Invalid refresh token'
      });
    }

    // Get user
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'User not found or inactive'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    res.json({
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Token Refresh Failed',
      message: 'Invalid or expired refresh token'
    });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Clear FCM token
    await req.user.update({
      fcm_token: null
    });

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout Failed',
      message: error.message
    });
  }
});

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Phone number is required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        message: 'If the phone number exists, an OTP will be sent'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP
    await user.update({
      otp,
      otp_expires_at: otpExpires
    });

    logger.info(`Password reset OTP for ${phone}: ${otp}`);

    res.status(200).json({
      message: 'If the phone number exists, an OTP will be sent',
      // In production, send OTP via SMS
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      expires_in: 600
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Request Failed',
      message: error.message
    });
  }
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, otp, new_password } = req.body;

    if (!phone || !otp || !new_password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Phone, OTP, and new password are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({
        error: 'Reset Failed',
        message: 'User not found'
      });
    }

    // Verify OTP
    if (user.otp !== otp || new Date() > user.otp_expires_at) {
      return res.status(400).json({
        error: 'Reset Failed',
        message: 'Invalid or expired OTP'
      });
    }

    // Update password
    await user.update({
      password: new_password,
      otp: null,
      otp_expires_at: null
    });

    res.json({
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      error: 'Reset Failed',
      message: error.message
    });
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // Get society details
    let society = null;
    if (user.society_id) {
      society = await Society.findByPk(user.society_id);
    }

    // Get flat details
    let flat = null;
    if (user.flat_id) {
      flat = await Flat.findByPk(user.flat_id);
    }

    // Get role details
    let role = null;
    if (user.role_id) {
      role = await Role.findByPk(user.role_id);
    }

    res.json({
      user: user.toJSON(),
      society,
      flat,
      role
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// Import Block model for flat route
const Block = require('../models/Block');

module.exports = router;
