const stockService = require('../service/materialStock.service');
const MaterialStock = require('../models/materialStock.model');
/* ========= STOCK IN ========= */
exports.stockIn = async (req, res) => {
  try {
    const { materialId, warehouseId, qty,referenceType } = req.body;

    if (!materialId || !warehouseId || !qty || !referenceType) {
      return res.status(400).json({
        success: false,
        message: 'materialId, warehouseId , refrenceType and qty are required'
      });
    }

    const stock = await stockService.stockIn({
      materialId,
      warehouseId,
      qty,
      referenceType,
      orgId: req.user.organization.orgId,
      user: req.user
    });

    res.json({
      success: true,
      message: 'Stock added successfully',
      data: stock
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ========= RESERVE ========= */
exports.reserve = async (req, res) => {
  try {
    const { materialId, warehouseId, qty } = req.body;

    await stockService.reserve({
      materialId,
      warehouseId,
      qty,
      orgId: req.user.organization.orgId
    });

    res.json({ success: true, message: 'Stock reserved successfully' });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ========= RELEASE ========= */
exports.release = async (req, res) => {
  try {
    const { materialId, warehouseId, qty } = req.body;

    await stockService.release({
      materialId,
      warehouseId,
      qty,
      orgId: req.user.organization.orgId
    });

    res.json({ success: true, message: 'Stock released successfully' });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ========= CONSUME ========= */
exports.consume = async (req, res) => {
  try {
    const { materialId, warehouseId, qty } = req.body;

    await stockService.consume({
      materialId,
      warehouseId,
      qty,
      orgId: req.user.organization.orgId
    });

    res.json({ success: true, message: 'Stock consumed successfully' });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ========= LIST ========= */
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
          let: { mid: { $toObjectId: '$materialId' } },
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
          let: { wid: { $toObjectId: '$warehouseId' } },
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
          referenceType:1,
          availableQty: 1,
          reservedQty: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },

      { $sort: { createdAt: sortOrder } },
      { $skip: skip },
      { $limit: limit }
    ];

    const [stocks, total] = await Promise.all([
      MaterialStock.aggregate(pipeline),
      MaterialStock.countDocuments({ orgId, isDeleted: false })
    ]);

    return res.json({
      success: true,
      data: stocks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('MaterialStock List Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch material stock',
      error: error.message
    });
  }
};
