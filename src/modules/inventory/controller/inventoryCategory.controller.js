const InventoryCategory = require('../models/inventoryCategory.model');

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;

    // 🔴 Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // 🔴 Prevent duplicate category per org
    const exists = await InventoryCategory.findOne({
      name: name.trim(),
      orgId: req.user.organization.orgId,
      isDeleted: false
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await InventoryCategory.create({
      name: name.trim(),
      description,
      orgId: req.user.organization.orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: err.message
    });
  }
};

exports.list = async (req, res) => {
  try {
    // ❌ Remove console.log in production
    // console.log(req.user);

    const categories = await InventoryCategory.find({
      orgId: req.user.organization.orgId,
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: err.message
    });
  }
};


exports.remove = async (req, res) => {
  try {
    const category = await InventoryCategory.findOneAndUpdate(
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

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or already deleted'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: err.message
    });
  }
};

