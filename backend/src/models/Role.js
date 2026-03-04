/**
 * Role Model
 * User roles and permissions management
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('roles', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Role name is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['is_active'] }
  ]
});

// Class Methods
Role.associate = (models) => {
  Role.hasMany(models.User, { foreignKey: 'role_id', as: 'users' });
};

module.exports = Role;
