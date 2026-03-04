/**
 * Models Index
 * Export all models and setup associations
 */

const { sequelize } = require('../config/database');
const Society = require('./Society');
const Block = require('./Block');
const Flat = require('./Flat');
const User = require('./User');
const Role = require('./Role');
const Bill = require('./Bill');
const Complaint = require('./Complaint');
const Visitor = require('./Visitor');

// Define Associations
const setupAssociations = () => {
  // Society -> Blocks
  Society.hasMany(Block, { foreignKey: 'society_id', as: 'blocks' });
  Block.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

  // Block -> Flats
  Block.hasMany(Flat, { foreignKey: 'block_id', as: 'flats' });
  Flat.belongsTo(Block, { foreignKey: 'block_id', as: 'block' });

  // Society -> Flats
  Society.hasMany(Flat, { foreignKey: 'society_id', as: 'flats' });
  Flat.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

  // Flat -> Users
  Flat.hasMany(User, { foreignKey: 'flat_id', as: 'residents' });
  User.belongsTo(Flat, { foreignKey: 'flat_id', as: 'flat' });

  // Society -> Users
  Society.hasMany(User, { foreignKey: 'society_id', as: 'users' });
  User.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

  // Role -> Users
  Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
  User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

  // Flat -> Bills
  Flat.hasMany(Bill, { foreignKey: 'flat_id', as: 'bills' });
  Bill.belongsTo(Flat, { foreignKey: 'flat_id', as: 'flat' });

  // Society -> Bills
  Society.hasMany(Bill, { foreignKey: 'society_id', as: 'bills' });
  Bill.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

  // Flat -> Complaints
  Flat.hasMany(Complaint, { foreignKey: 'flat_id', as: 'complaints' });
  Complaint.belongsTo(Flat, { flatId: 'flat_id', as: 'flat' });

  // User -> Complaints
  User.hasMany(Complaint, { foreignKey: 'user_id', as: 'complaints' });
  Complaint.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Society -> Complaints
  Society.hasMany(Complaint, { foreignKey: 'society_id', as: 'complaints' });
  Complaint.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

  // Flat -> Visitors
  Flat.hasMany(Visitor, { foreignKey: 'flat_id', as: 'visitors' });
  Visitor.belongsTo(Flat, { foreignKey: 'flat_id', as: 'flat' });

  // Society -> Visitors
  Society.hasMany(Visitor, { foreignKey: 'society_id', as: 'visitors' });
  Visitor.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

  console.log('✅ Database associations established');
};

// Initialize models
const initModels = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    setupAssociations();
    
    // Sync database (only in development)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  Society,
  Block,
  Flat,
  User,
  Role,
  Bill,
  Complaint,
  Visitor,
  initModels
};
