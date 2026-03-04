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
    references: { model: 'societies', key: 'id' }
  },
  flat_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'flats', key: 'id' }
  },
  bill_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  bill_month: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  bill_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maintenance_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  parking_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  water_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  other_charges: {
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
  late_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  generated_by: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['flat_id'] },
    { fields: ['status'] },
    { fields: ['bill_month', 'bill_year'] }
  ]
});

// Class Methods
Bill.associate = (models) => {
  Bill.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Bill.belongsTo(models.Flat, { foreignKey: 'flat_id', as: 'flat' });
  Bill.hasMany(models.Payment, { foreignKey: 'bill_id', as: 'payments' });
};

module.exports = Bill;
