/**
 * Amenity Model
 * Society amenities (clubhouse, pool, gym, etc.)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Amenity = sequelize.define('amenities', {
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
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Amenity name is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  amenity_type: {
    type: DataTypes.ENUM(
      'CLUBHOUSE', 
      'GYM', 
      'SWIMMING_POOL', 
      'TENNIS COURT', 
      'BASKETBALL COURT', 
      'BADMINTON COURT', 
      'GARDEN', 
      'PARK', 
      'BBQ_AREA', 
      'FUNCTION_HALL', 
      'GUEST_ROOM', 
      'OTHER'
    ),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Maximum number of people allowed'
  },
  timing_open: {
    type: DataTypes.TIME,
    allowNull: true
  },
  timing_close: {
    type: DataTypes.TIME,
    allowNull: true
  },
  booking_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Charge per hour or per booking'
  },
  security_deposit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  max_advance_days: {
    type: DataTypes.INTEGER,
    defaultValue: 7,
    comment: 'Maximum days in advance for booking'
  },
  min_booking_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  max_booking_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 4
  },
  requires_approval: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_available_for_all: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'If false, only owners can book'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['name'] },
    { fields: ['amenity_type'] },
    { fields: ['is_active'] }
  ]
});

// Class Methods
Amenity.associate = (models) => {
  Amenity.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Amenity.hasMany(models.AmenityBooking, { foreignKey: 'amenity_id', as: 'bookings' });
};

module.exports = Amenity;
