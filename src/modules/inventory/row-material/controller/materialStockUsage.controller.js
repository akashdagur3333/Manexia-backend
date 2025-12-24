const MaterialStock = require('../models/materialStock.model');
const MaterialStockUsage = require('../models/materialStockUsage.model');

exports.create = async (req, res) => {
  try {
    const { materialId, warehouseId, quantity, type, remark } = req.body;
    const orgId = req.user.organization.orgId;

    // 🔹 Validation
    if (!materialId || !warehouseId || !quantity || !type) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    if (!['IN', 'OUT'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock type'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero'
      });
    }

    // 🔹 Find stock
    let stock = await MaterialStock.findOne({
      materialId,
      warehouseId,
      orgId,
      isDeleted: false
    });

    // 🔹 OUT validation
    if (type === 'OUT') {
      if (!stock || stock.availableQty < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
    }

    // 🔹 Create stock if not exists (IN case)
    if (!stock && type === 'IN') {
      stock = await MaterialStock.create({
        materialId,
        warehouseId,
        availableQty: 0,
        orgId,
        createdBy: {
          userId: req.user.userId,
          name: req.user.name,
          email: req.user.email
        }
      });
    }

    // 🔹 Update stock quantity
    await MaterialStock.updateOne(
      { _id: stock._id },
      {
        $inc: {
          availableQty: type === 'IN' ? quantity : -quantity
        }
      }
    );

    // 🔹 Save usage history
    const usage = await MaterialStockUsage.create({
      materialId,
      warehouseId,
      quantity,
      type,
      remark,
      orgId,
      createdBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }
    });

    res.json({
      success: true,
      message: 'Stock usage recorded successfully',
      data: usage
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      /* =====================
         BASE FILTER
      ===================== */
      {
        $match: {
          orgId,
          isDeleted: false
        }
      },

      /* =====================
         MATERIAL LOOKUP
      ===================== */
      {
        $lookup: {
          from: 'materials',
          let: {
            mid: {
              $cond: [
                { $regexMatch: { input: '$materialId', regex: /^[a-f\d]{24}$/i } },
                { $toObjectId: '$materialId' },
                null
              ]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$mid'] },
                isDeleted: false
              }
            },
            {
              $project: {
                _id: 1,
                name: 1
              }
            }
          ],
          as: 'material'
        }
      },
      {
        $unwind: {
          path: '$material',
          preserveNullAndEmptyArrays: true
        }
      },

      /* =====================
         WAREHOUSE LOOKUP
      ===================== */
      {
        $lookup: {
          from: 'warehouses',
          let: {
            wid: {
              $cond: [
                { $regexMatch: { input: '$warehouseId', regex: /^[a-f\d]{24}$/i } },
                { $toObjectId: '$warehouseId' },
                null
              ]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$wid'] },
                isDeleted: false
              }
            },
            {
              $project: {
                _id: 1,
                name: 1
              }
            }
          ],
          as: 'warehouse'
        }
      },
      {
        $unwind: {
          path: '$warehouse',
          preserveNullAndEmptyArrays: true
        }
      },

      /* =====================
         FINAL PROJECTION
      ===================== */
      {
        $project: {
          _id: 1,

          materialId: '$material._id',
          materialName: '$material.name',

          warehouseId: '$warehouse._id',
          warehouseName: '$warehouse.name',

          quantity: 1,
          type: 1,          // IN / OUT
          remark: 1,

          createdAt: 1,
          updatedAt: 1,

          createdBy: 1
        }
      },

      { $sort: { createdAt: sortOrder } },
      { $skip: skip },
      { $limit: limit }
    ];

    const [usageList, total] = await Promise.all([
      MaterialStockUsage.aggregate(pipeline),
      MaterialStockUsage.countDocuments({ orgId, isDeleted: false })
    ]);

    return res.json({
      success: true,
      data: usageList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('MaterialStockUsage List Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch stock usage',
      error: error.message
    });
  }
};
