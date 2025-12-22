const InventoryUnit = require('../models/inventoryUnit.model');

exports.create = async (req, res) => {
  try {
    const { name, symbol } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Unit name is required'
      });
    }

    // Prevent duplicate unit per org
    const exists = await InventoryUnit.findOne({
      name: name.trim(),
      orgId: req.user.organization.orgId,
      isDeleted: false
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Unit already exists'
      });
    }

    const unit = await InventoryUnit.create({
      name: name.trim(),
      symbol,
      orgId: req.user.organization.orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    res.status(201).json({
      success: true,
      message: 'Unit created successfully',
      data: unit
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create unit',
      error: err.message
    });
  }
};

exports.list = async (req, res) => {
  try {
    const units = await InventoryUnit.find({
      orgId: req.user.organization.orgId,
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: units
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch units',
      error: err.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const unit = await InventoryUnit.findOneAndUpdate(
      {
        _id: req.params.id,
        orgId: req.user.organization.orgId,
        isDeleted: false
      },
      {
        isDeleted: true,
        deletedBy: {
          userId: req.user.userId,
          name: req.user.name,
          email: req.user.email,
          deletedAt: new Date()
        }
      },
      { new: true }
    );

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found or already deleted'
      });
    }

    res.json({
      success: true,
      message: 'Unit deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete unit',
      error: err.message
    });
  }
};

