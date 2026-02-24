/**
 * ChatMessage Model
 * Society chat messages
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatMessage = sequelize.define('chat_messages', {
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
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
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
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Message cannot be empty' }
    }
  },
  message_type: {
    type: DataTypes.ENUM('TEXT', 'IMAGE', 'NOTICE', 'ANNOUNCEMENT'),
    defaultValue: 'TEXT'
  },
  attachment_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_announcement: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['society_id'] },
    { fields: ['user_id'] },
    { fields: ['flat_id'] },
    { fields: ['created_at'] }
  ]
});

// Class Methods
ChatMessage.associate = (models) => {
  ChatMessage.belongsTo(models.Society, { foreignKey: 'society_id', as: 'society' });
  ChatMessage.belongsTo(models.User, { foreignKey: 'user_id', as: 'sender' });
  ChatMessage.belongsTo(models.Flat, { foreignKey: 'flat_id', as: 'flat' });
};

module.exports = ChatMessage;
