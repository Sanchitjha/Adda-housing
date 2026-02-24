/**
 * Payment Model
 * Tracks all maintenance and other payments
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('payments', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  society_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'societies',
      key: 'id'
    }
  },
  flat_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'flats',
      key: 'id'
    }
  },
  bill_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'bills',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  payment_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  payment_type: {
    type: DataTypes.ENUM('MAINTENANCE', 'AMENITY', 'PARKING', 'EVENT', 'OTHER'),
    defaultValue: 'MAINTENANCE'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Amount cannot be negative' }
    }
  },
  payment_method: {
    type: DataTypes.ENUM('CASH', 'CHEQUE', 'ONLINE', 'UPI', 'RAZORPAY', 'BANK_TRANSFER'),
    allowNull: false
  },
  transaction_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  razorpay_payment_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  razorpay_order_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  razorpay_signature: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  payment_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  reference_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cheque_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  branch_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  payment_note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  receipt_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  receipt_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['flat_id'] },
    { fields: ['bill_id'] },
    { fields: ['user_id'] },
    { fields: ['payment_number'], unique: true },
    { fields: ['status'] },
    { fields: ['payment_date'] },
    { fields: ['transaction_id'] }
  ]
});

// Class Methods
Payment.associate = (models) => {
  Payment.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Payment.belongsTo(models.Flat, { foreignKey: 'flat_id', as: 'flat' });
  Payment.belongsTo(models.Bill, { foreignKey: 'bill_id', as: 'bill' });
  Payment.belongsTo(models.User, { foreignKey: 'user_id', as: 'payer' });
  Payment.belongsTo(models.User, { foreignKey: 'created_by', as: 'collector' });
};

module.exports = Payment;
