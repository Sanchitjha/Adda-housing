/**
 * Role Model
 * Defines user roles within a society (Chairman, Secretary, Accountant, etc.)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('roles', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  society_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'societies',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Role name is required' }
    }
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Role code is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'JSON object containing role permissions'
  },
  is_system_role: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'System roles cannot be deleted'
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
    { fields: ['code'] }
  ]
});

// Default system roles
Role.SYSTEM_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CHAIRMAN: 'CHAIRMAN',
  SECRETARY: 'SECRETARY',
  ACCOUNTANT: 'ACCOUNTANT',
  SECURITY: 'SECURITY',
  RESIDENT: 'RESIDENT',
  TENANT: 'TENANT',
  OWNER: 'OWNER'
};

// Class Methods
Role.associate = (models) => {
  Role.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Role.hasMany(models.User, { foreignKey: 'role_id', as: 'users' });
};

module.exports = Role;
