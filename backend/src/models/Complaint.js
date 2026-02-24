/**
 * Complaint Model
 * Resident complaints and maintenance requests
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Complaint = sequelize.define('complaints', {
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
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  complaint_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.ENUM(
      'PLUMBING', 
      'ELECTRICAL', 
      'CLEANING', 
      'SECURITY', 
      'PARKING', 
      'NOISE', 
      'MAINTENANCE', 
      'PEST_CONTROL', 
      'LIFT', 
      'OTHER'
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    defaultValue: 'MEDIUM'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Complaint title is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Complaint description is required' }
    }
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Specific location within flat/complex'
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'),
    defaultValue: 'OPEN'
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assigned_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  resolution_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  resolution_note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolution_images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  feedback_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: { args: [1], msg: 'Rating must be between 1 and 5' },
      max: { args: [5], msg: 'Rating must be between 1 and 5' }
    }
  },
  feedback_comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_emergency: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['flat_id'] },
    { fields: ['user_id'] },
    { fields: ['complaint_number'], unique: true },
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['assigned_to'] }
  ]
});

// Class Methods
Complaint.associate = (models) => {
  Complaint.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Complaint.belongsTo(models.Flat, { foreignKey: 'flat_id', as: 'flat' });
  Complaint.belongsTo(models.User, { foreignKey: 'user_id', as: 'complainant' });
  Complaint.belongsTo(models.User, { foreignKey: 'assigned_to', as: 'assignee' });
};

module.exports = Complaint;
