/**
 * Society Model
 * Represents a housing society/apartment complex
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Society = sequelize.define('societies', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Society name is required' },
      len: { args: [3, 200], msg: 'Society name must be between 3 and 200 characters' }
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Address is required' }
    }
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      is: { args: /^[0-9]{6}$/, msg: 'Invalid pincode' }
    }
  },
  registration_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  contact_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: { msg: 'Invalid email format' }
    }
  },
  contact_phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Contact phone is required' }
    }
  },
  total_blocks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_flats: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maintenance_per_sqft: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bank_account_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  bank_ifsc: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  razorpay_key_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['city'] },
    { fields: ['is_active'] }
  ]
});

// Instance Methods
Society.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.created_at;
  delete values.updated_at;
  return values;
};

module.exports = Society;
