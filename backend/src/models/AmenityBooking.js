/**
 * AmenityBooking Model
 * Tracks amenity bookings by residents
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AmenityBooking = sequelize.define('amenity_bookings', {
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
  amenity_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'amenities',
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
  booking_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  booking_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  total_hours: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  security_deposit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'),
    defaultValue: 'PENDING'
  },
  purpose: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  number_of_guests: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approval_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  payment_status: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'REFUNDED'),
    defaultValue: 'PENDING'
  },
  payment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'payments',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['amenity_id'] },
    { fields: ['flat_id'] },
    { fields: ['user_id'] },
    { fields: ['booking_number'], unique: true },
    { fields: ['status'] },
    { fields: ['booking_date'] }
  ]
});

// Class Methods
AmenityBooking.associate = (models) => {
  AmenityBooking.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  AmenityBooking.belongsTo(models.Amenity, { foreignKey: 'amenity_id', as: 'amenity' });
  AmenityBooking.belongsTo(models.Flat, { foreignKey: 'flat_id', as: 'flat' });
  AmenityBooking.belongsTo(models.User, { foreignKey: 'user_id', as: 'booker' });
  AmenityBooking.belongsTo(models.User, { foreignKey: 'approved_by', as: 'approver' });
  AmenityBooking.belongsTo(models.Payment, { foreignKey: 'payment_id', as: 'payment' });
};

module.exports = AmenityBooking;
