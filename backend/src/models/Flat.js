/**
 * Flat Model
 * Represents an individual flat/apartment within a block
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Flat = sequelize.define('flats', {
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
  block_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'blocks',
      key: 'id'
    }
  },
  flat_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Flat number is required' }
    }
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Floor cannot be negative' }
    }
  },
  type: {
    type: DataTypes.ENUM('1BHK', '2BHK', '3BHK', '4BHK', 'PENTHOUSE', 'VILLA'),
    defaultValue: '2BHK'
  },
  square_feet: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'Square feet cannot be negative' }
    }
  },
  owner_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  owner_phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  owner_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: { msg: 'Invalid email format' }
    }
  },
  tenant_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tenant_phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  maintenance_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  is_occupied: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_owner_occupied: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  parking_slot: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  vehicle_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['block_id'] },
    { fields: ['flat_number'] },
    { fields: ['is_active'] },
    { fields: ['society_id', 'block_id', 'flat_number'], unique: true }
  ]
});

// Class Methods
Flat.associate = (models) => {
  Flat.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Flat.belongsTo(models.Block, { foreignKey: 'block_id', as: 'block' });
  Flat.hasMany(models.User, { foreignKey: 'flat_id', as: 'residents' });
  Flat.hasMany(models.Bill, { foreignKey: 'flat_id', as: 'bills' });
  Flat.hasMany(models.Visitor, { foreignKey: 'flat_id', as: 'visitors' });
};

module.exports = Flat;
