/**
 * Complaint Model
 * Resident complaints and issues tracking
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
    references: { model: 'societies', key: 'id' }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  flat_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'flats', key: 'id' }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'),
    defaultValue: 'OPEN'
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT'),
    defaultValue: 'NORMAL'
  },
  assigned_to: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  resolution_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['user_id'] },
    { fields: ['flat_id'] },
    { fields: ['status'] },
    { fields: ['category'] }
  ]
});

// Class Methods
Complaint.associate = (models) => {
  Complaint.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Complaint.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Complaint.belongsTo(models.Flat, { foreignKey: 'flat_id', as: 'flat' });
  Complaint.belongsTo(models.User, { foreignKey: 'assigned_to', as: 'assignee' });
};

module.exports = Complaint;
