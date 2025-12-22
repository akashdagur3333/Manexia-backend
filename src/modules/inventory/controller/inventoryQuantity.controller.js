const InventoryQuantity = require('../models/inventoryQuantity.model');

exports.create = async (req, res) => {
  try {
    const { name, minValue, maxValue } = req.body;

    // 🔴 Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Quantity name is required'
      });
    }

    // 🔴 Prevent duplicate quantity per org
    const exists = await InventoryQuantity.findOne({
      name: name.trim(),
      orgId: req.user.organization.orgId,
      isDeleted: false
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Quantity already exists'
      });
    }

    const quantity = await InventoryQuantity.create({
      name: name.trim(),
      minValue,
      maxValue,
      orgId: req.user.organization.orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    res.status(201).json({
      success: true,
      message: 'Quantity created successfully',
      data: quantity
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create quantity',
      error: err.message
    });
  }
};


exports.list = async (req, res) => {
  try {
    const quantities = await InventoryQuantity.find({
      orgId: req.user.organization.orgId,
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quantities
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quantities',
      error: err.message
    });
  }
};


exports.remove = async (req, res) => {
  try {
    const quantity = await InventoryQuantity.findOneAndUpdate(
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

    if (!quantity) {
      return res.status(404).json({
        success: false,
        message: 'Quantity not found or already deleted'
      });
    }

    res.json({
      success: true,
      message: 'Quantity deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete quantity',
      error: err.message
    });
  }
};

