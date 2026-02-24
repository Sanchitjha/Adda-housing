/**
 * User Model
 * Represents residents, admins, and staff members
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('users', {
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
  flat_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'flats',
      key: 'id'
    }
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'roles',
      key: 'id'
    }
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
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: { msg: 'Invalid email format' }
    }
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Phone number is required' }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    set(value) {
      if (value) {
        this.setDataValue('password', bcrypt.hashSync(value, 12));
      }
    }
  },
  user_type: {
    type: DataTypes.ENUM('RESIDENT', 'ADMIN', 'STAFF', 'GUARD', 'OWNER', 'TENANT'),
    defaultValue: 'RESIDENT'
  },
  profile_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
    allowNull: true
  },
  aadhaar_number: {
    type: DataTypes.STRING(12),
    allowNull: true
  },
  blood_group: {
    type: DataTypes.STRING(5),
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
  fcm_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  device_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: true
  },
  otp_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  password_reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['flat_id'] },
    { fields: ['phone'] },
    { fields: ['email'] },
    { fields: ['user_type'] },
    { fields: ['is_active'] }
  ]
});

// Instance Methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.otp;
  delete values.otp_expires_at;
  delete values.password_reset_token;
  delete values.password_reset_expires;
  delete values.created_at;
  delete values.updated_at;
  return values;
};

User.prototype.getFullName = function() {
  return `${this.first_name}${this.last_name ? ' ' + this.last_name : ''}`;
};

// Class Methods
User.associate = (models) => {
  User.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  User.belongsTo(models.Flat, { foreignKey: 'flat_id', as: 'flat' });
  User.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
  User.hasMany(models.Complaint, { foreignKey: 'user_id', as: 'complaints' });
  User.hasMany(models.Payment, { foreignKey: 'user_id', as: 'payments' });
  User.hasMany(models.Notice, { foreignKey: 'created_by', as: 'notices' });
};

module.exports = User;
