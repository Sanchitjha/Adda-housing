/**
 * Visitor Model
 * Visitor tracking and management
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Visitor = sequelize.define('visitors', {
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
  flat_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'flats', key: 'id' }
  },
  visitor_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  visitor_phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  visitor_photo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  purpose: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  flat_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  in_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  out_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  qr_code: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  approval_status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  approved_by: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  vehicle_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  is_delivery: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  delivery_item: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['flat_id'] },
    { fields: ['in_time'] },
    { fields: ['approval_status'] }
  ]
});

// Class Methods
Visitor.associate = (models) => {
  Visitor.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Visitor.belongsTo(models.Flat, { foreignKey: 'flat_id', as: 'flat' });
  Visitor.belongsTo(models.User, { foreignKey: 'approved_by', as: 'approver' });
};

module.exports = Visitor;
