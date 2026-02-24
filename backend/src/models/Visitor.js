/**
 * Visitor Model
 * Tracks visitors and deliveries to the society
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
  visitor_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  visitor_type: {
    type: DataTypes.ENUM('GUEST', 'DELIVERY', 'CAB', 'RELATIVE', 'SERVICE', 'VENDOR', 'OTHER'),
    defaultValue: 'GUEST'
  },
  visitor_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Visitor name is required' }
    }
  },
  visitor_phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  visitor_email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  visitor_photo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  visitor_id_proof: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  vehicle_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  purpose: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Purpose of visit is required' }
    }
  },
  whom_to_meet: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  flat_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  entry_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  exit_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expected_exit_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENum('PENDING', 'APPROVED', 'REJECTED', 'ARRIVED', 'DEPARTED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  entry_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  exit_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approval_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  qr_code: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'QR code URL for visitor pass'
  },
  number_of_persons: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  delivery_item: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'For delivery type visitors'
  },
  delivery_company: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  is_emergency_contact: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['flat_id'] },
    { fields: ['visitor_number'], unique: true },
    { fields: ['status'] },
    { fields: ['entry_time'] },
    { fields: ['visitor_type'] }
  ]
});

// Class Methods
Visitor.associate = (models) => {
  Visitor.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Visitor.belongsTo(models.Flat, { foreignKey: 'flat_id', as: 'flat' });
  Visitor.belongsTo(models.User, { foreignKey: 'entry_by', as: 'entryGuard' });
  Visitor.belongsTo(models.User, { foreignKey: 'exit_by', as: 'exitGuard' });
  Visitor.belongsTo(models.User, { foreignKey: 'approved_by', as: 'approver' });
};

module.exports = Visitor;
