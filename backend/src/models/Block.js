/**
 * Block Model
 * Represents a building/block within a society
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Block = sequelize.define('blocks', {
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
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Block name is required' }
    }
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Block code is required' }
    }
  },
  total_floors: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Total floors cannot be negative' }
    }
  },
  flats_per_floor: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    validate: {
      min: { args: [1], msg: 'Flats per floor must be at least 1' }
    }
  },
  description: {
    type: DataTypes.TEXT,
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
    { fields: ['name'] },
    { fields: ['is_active'] }
  ]
});

// Class Methods
Block.associate = (models) => {
  Block.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Block.hasMany(models.Flat, { foreignKey: 'block_id', as: 'flats' });
};

module.exports = Block;
