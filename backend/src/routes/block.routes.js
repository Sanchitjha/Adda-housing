/**
 * Block Routes
 * CRUD operations for society blocks/buildings
 */

const express = require('express');
const router = express.Router();
const { Block, Flat, Society } = require('../models');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// GET /api/v1/blocks - List blocks (with society context)
router.get('/', authenticate, async (req, res) => {
  try {
    const { society_id, search, limit = 50, offset = 0 } = req.query;
    
    // For residents, only show blocks in their society
    const where = {};
    
    if (society_id) {
      where.society_id = society_id;
    } else if (req.user.society_id) {
      where.society_id = req.user.society_id;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const blocks = await Block.findAndCountAll({
      where,
      include: [
        { model: Society, as: 'society', attributes: ['id', 'name'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      blocks: blocks.rows,
      total: blocks.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Get blocks error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// GET /api/v1/blocks/:id - Get block details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const block = await Block.findByPk(id, {
      include: [
        { model: Society, as: 'society', attributes: ['id', 'name'] },
        { 
          model: Flat, 
          as: 'flats', 
          attributes: ['id', 'flat_number', 'floor', 'type', 'is_occupied'] 
        }
      ]
    });

    if (!block) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Block not found'
      });
    }

    res.json({ block });
  } catch (error) {
    logger.error('Get block error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
});

// POST /api/v1/blocks - Create block
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { society_id, name, code, total_floors, flats_per_floor, description } = req.body;

    // Verify society exists
    const society = await Society.findByPk(society_id || req.user.society_id);
    if (!society) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Society not found'
      });
    }

    // Check for duplicate block code within society
    const existingBlock = await Block.findOne({
      where: { 
        society_id: society.id,
        code: code.toUpperCase()
      }
    });
    
    if (existingBlock) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Block code already exists in this society'
      });
    }

    // Create block
    const block = await Block.create({
      society_id: society.id,
      name,
      code: code.toUpperCase(),
      total_floors: total_floors || 0,
      flats_per_floor: flats_per_floor || 4,
      description
    });

    // Update society block count
    await society.update({
      total_blocks: await Block.count({ where: { society_id: society.id } })
    });

    logger.info(`Block created: ${block.id} in society ${society.id}`);

    res.status(201).json({
      message: 'Block created successfully',
      block
    });
  } catch (error) {
    logger.error('Create block error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: error.message
    });
  }
});

// PUT /api/v1/blocks/:id - Update block
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, total_floors, flats_per_floor, description, is_active } = req.body;
    
    const block = await Block.findByPk(id);
    if (!block) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Block not found'
      });
    }

    // Check for duplicate code if changing
    if (code && code.toUpperCase() !== block.code) {
      const existing = await Block.findOne({
        where: { 
          society_id: block.society_id,
          code: code.toUpperCase(),
          id: { [Op.ne]: id }
        }
      });
      
      if (existing) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Block code already exists'
        });
      }
    }

    await block.update({
      name: name || block.name,
      code: code ? code.toUpperCase() : block.code,
      total_floors: total_floors !== undefined ? total_floors : block.total_floors,
      flats_per_floor: flats_per_floor || block.flats_per_floor,
      description: description !== undefined ? description : block.description,
      is_active: is_active !== undefined ? is_active : block.is_active
    });

    res.json({
      message: 'Block updated successfully',
      block
    });
  } catch (error) {
    logger.error('Update block error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: error.message
    });
  }
});

// DELETE /api/v1/blocks/:id - Delete block
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const block = await Block.findByPk(id);
    if (!block) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Block not found'
      });
    }

    // Check if block has flats
    const flatCount = await Flat.count({ where: { block_id: id } });
    if (flatCount > 0) {
      // Soft delete
      await block.update({ is_active: false });
    } else {
      // Hard delete
      await block.destroy();
    }

    // Update society block count
    const society = await Society.findByPk(block.society_id);
    if (society) {
      await society.update({
        total_blocks: await Block.count({ where: { society_id: society.id } })
      });
    }

    res.json({
      message: 'Block deleted successfully'
    });
  } catch (error) {
    logger.error('Delete block error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: error.message
    });
  }
});

module.exports = router;
