/**
 * Bill Model
 * Maintenance bills for flats
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bill = sequelize.define('bills', {
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
  bill_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  bill_type: {
    type: DataTypes.ENUM('MONTHLY', 'QUARTERLY', 'ANNUAL', 'SPECIAL', 'METER_CHARGE'),
    defaultValue: 'MONTHLY'
  },
  bill_month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Month must be between 1 and 12' },
      max: { args: [12], msg: 'Month must be between 1 and 12' }
    }
  },
  bill_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [2020], msg: 'Year must be 2020 or later' }
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Amount cannot be negative' }
    }
  },
  meter_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  parking_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  penalty_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  late_penalty_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Percentage of late penalty per month'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  paid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paid_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  generated_by: {
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
    { fields: ['bill_number'], unique: true },
    { fields: ['status'] },
    { fields: ['bill_month', 'bill_year'] },
    { fields: ['due_date'] }
  ]
});

// Calculate total before saving
Bill.beforeValidate(async (bill) => {
  const total = parseFloat(bill.amount || 0) + 
                parseFloat(bill.meter_charge || 0) + 
                parseFloat(bill.parking_charge || 0) + 
                parseFloat(bill.penalty_amount || 0) - 
                parseFloat(bill.discount_amount || 0);
  bill.total_amount = total.toFixed(2);
});

// Class Methods
Bill.associate = (models) => {
  Bill.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Bill.belongsTo(models.Flat, { foreignKey: 'flat_id', as: 'flat' });
  Bill.belongsTo(models.User, { foreignKey: 'generated_by', as: 'generator' });
  Bill.hasMany(models.Payment, { foreignKey: 'bill_id', as: 'payments' });
};

module.exports = Bill;
