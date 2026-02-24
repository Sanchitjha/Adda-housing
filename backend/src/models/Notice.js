/**
 * Notice Model
 * Society notices and announcements
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notice = sequelize.define('notices', {
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
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Notice title is required' }
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Notice content is required' }
    }
  },
  notice_type: {
    type: DataTypes.ENUM('GENERAL', 'IMPORTANT', 'EVENT', 'MAINTENANCE', 'EMERGENCY', 'MEETING'),
    defaultValue: 'GENERAL'
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH'),
    defaultValue: 'NORMAL'
  },
  attachment_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  attachment_name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  publish_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  target_audience: {
    type: DataTypes.ENUM('ALL', 'OWNERS', 'TENANTS', 'STAFF'),
    defaultValue: 'ALL'
  },
  target_block_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'blocks',
      key: 'id'
    }
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['created_by'] },
    { fields: ['notice_type'] },
    { fields: ['publish_date'] },
    { fields: ['is_published'] }
  ]
});

// Class Methods
Notice.associate = (models) => {
  Notice.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  Notice.belongsTo(models.User, { foreignKey: 'created_by', as: 'author' });
  Notice.belongsTo(models.Block, { foreignKey: 'target_block_id', as: 'targetBlock' });
};

module.exports = Notice;
