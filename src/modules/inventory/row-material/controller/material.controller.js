const Material = require('../models/material.model');

exports.create = async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      unitId,
      quantityId,
      reorderLevel
    } = req.body;

    // 🔴 Basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Material name is required'
      });
    }

    if (!categoryId || !unitId || !quantityId) {
      return res.status(400).json({
        success: false,
        message: 'Category, Unit and Quantity Type are required'
      });
    }

    // 🔴 Prevent duplicate material per org
    const exists = await Material.findOne({
      name: name.trim(),
      orgId: req.user.organization.orgId,
      isDeleted: false
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Material already exists'
      });
    }

    const material = await Material.create({
      name: name.trim(),
      description,
      categoryId,
      unitId,
      quantityId,
      reorderLevel,
      orgId: req.user.organization.orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: material
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create material',
      error: err.message
    });
  }
};

exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const materials = await Material.aggregate([
      {
        $match: {
          orgId,
          isDeleted: false
        }
      },
    
      // 🔹 Convert string IDs → ObjectId
      {
        $addFields: {
          categoryObjId: { $toObjectId: '$categoryId' },
          unitObjId: { $toObjectId: '$unitId' },
          quantityObjId: { $toObjectId: '$quantityId' }
        }
      },
    
      // 🔹 Category lookup
      {
        $lookup: {
          from: 'inventorycategories',
          localField: 'categoryObjId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    
      // 🔹 Unit lookup
      {
        $lookup: {
          from: 'inventoryunits',
          localField: 'unitObjId',
          foreignField: '_id',
          as: 'unit'
        }
      },
      { $unwind: { path: '$unit', preserveNullAndEmptyArrays: true } },
    
      // 🔹 Quantity lookup
      {
        $lookup: {
          from: 'inventoryquantities',
          localField: 'quantityObjId',
          foreignField: '_id',
          as: 'quantity'
        }
      },
      { $unwind: { path: '$quantity', preserveNullAndEmptyArrays: true } },
    
      // 🔹 Final shape for frontend
      {
        $project: {
          name: 1,
          description: 1,
          reorderLevel: 1,
          createdAt: 1,
    
          category: {
            _id: '$category._id',
            name: '$category.name'
          },
          unit: {
            _id: '$unit._id',
            name: '$unit.name'
          },
          quantity: {
            _id: '$quantity._id',
            name: '$quantity.name'
          }
        }
      },
    
      { $sort: { createdAt: -1 } }
    ]);
    

    res.json({
      success: true,
      data: materials
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials',
      error: err.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const materialId = req.params.id;

    const {
      name,
      description,
      categoryId,
      unitId,
      quantityId,
      reorderLevel
    } = req.body;

    // 🔴 Validation
    if (name && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Material name cannot be empty'
      });
    }

    if (
      (categoryId === '') ||
      (unitId === '') ||
      (quantityId === '')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Category, Unit and Quantity Type are required'
      });
    }

    // 🔴 Prevent duplicate material name (excluding self)
    if (name) {
      const exists = await Material.findOne({
        _id: { $ne: materialId },
        name: name.trim(),
        orgId: req.user.organization.orgId,
        isDeleted: false
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Material with this name already exists'
        });
      }
    }

    const material = await Material.findOneAndUpdate(
      {
        _id: materialId,
        orgId: req.user.organization.orgId,
        isDeleted: false
      },
      {
        $set: {
          ...(name && { name: name.trim() }),
          ...(description !== undefined && { description }),
          ...(categoryId && { categoryId }),
          ...(unitId && { unitId}),
          ...(quantityId && { quantityId }),
          ...(reorderLevel !== undefined && { reorderLevel })
        }
      },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found or already deleted'
      });
    }

    res.json({
      success: true,
      message: 'Material updated successfully',
      data: material
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update material',
      error: err.message
    });
  }
};


exports.remove = async (req, res) => {
  try {
    const material = await Material.findOneAndUpdate(
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

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found or already deleted'
      });
    }

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete material',
      error: err.message
    });
  }
};

