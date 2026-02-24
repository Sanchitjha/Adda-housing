/**
 * Staff Model
 * Society staff members (security, maintenance, housekeeping)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Staff = sequelize.define('staff', {
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
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  staff_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'First name is required' }
    }
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Phone number is required' }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: { msg: 'Invalid email format' }
    }
  },
  photo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  staff_type: {
    type: DataTypes.ENUM(
      'SECURITY', 
      'MAINTENANCE', 
      'HOUSEKEEPING', 
      'GARDENER', 
      'ELECTRICIAN', 
      'PLUMBER', 
      'MANAGER', 
      'ACCOUNTANT', 
      'ADMIN_STAFF', 
      'OTHER'
    ),
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  date_of_joining: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  aadhaar_number: {
    type: DataTypes.STRING(12),
    allowNull: true
  },
  pan_number: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  shift_timing: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'e.g., 6AM-6PM, 6PM-6AM'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  termination_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  emergency_contact_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['staff_number'], unique: true },
    { fields: ['staff_type'] },
    { fields: ['is_active'] }
  ]
});

// Class Methods
Staff.associate = (models) => {
  Staff.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Staff.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
};

module.exports = Staff;
