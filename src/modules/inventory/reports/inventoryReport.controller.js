const Material = require('../row-material/models/material.model');
const MaterialStock = require('../row-material/models/materialStock.model');
const VendorOrder = require('../vendor/model/vendorOrder.model');
const CustomerOrder = require('../customer/model/customerOrder.model');

exports.currentStockReport = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;

    const stock = await MaterialStock.aggregate([
      {
        $match: { orgId }
      },

      /* MATERIAL LOOKUP */
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
            { $match: { $expr: { $eq: ['$_id', '$$mid'] }, isDeleted: false } },
            { $project: { name: 1 } }
          ],
          as: 'material'
        }
      },
      { $unwind: '$material' },

      /* WAREHOUSE LOOKUP */
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
            { $match: { $expr: { $eq: ['$_id', '$$wid'] }, isDeleted: false } },
            { $project: { name: 1 } }
          ],
          as: 'warehouse'
        }
      },
      { $unwind: '$warehouse' },

      {
        $project: {
          materialId: 1,
          materialName: '$material.name',
          warehouseId: 1,
          warehouseName: '$warehouse.name',
          availableQty: 1,
          reservedQty: 1
        }
      },

      { $sort: { materialName: 1 } }
    ]);

    res.json({ success: true, data: stock });

  } catch (error) {
    console.error('Current Stock Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock report'
    });
  }
};


exports.purchaseReport = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;
    const { fromDate, toDate } = req.query;

    const match = {
      orgId,
      isDeleted: { $ne: true },
      status: 'RECEIVED'
    };

    if (fromDate && toDate) {
      match.orderDate = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }

    const report = await VendorOrder.aggregate([
      { $match: match },
      { $unwind: '$items' },

      {
        $group: {
          _id: '$items.materialId',
          totalQty: { $sum: '$items.quantity' },
          totalAmount: { $sum: '$items.amount' }
        }
      },

      /* MATERIAL LOOKUP */
      {
        $lookup: {
          from: 'materials',
          let: {
            mid: {
              $cond: [
                { $regexMatch: { input: '$_id', regex: /^[a-f\d]{24}$/i } },
                { $toObjectId: '$_id' },
                null
              ]
            }
          },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$mid'] } } },
            { $project: { name: 1 } }
          ],
          as: 'material'
        }
      },
      { $unwind: '$material' },

      {
        $project: {
          materialId: '$_id',
          materialName: '$material.name',
          totalQty: 1,
          totalAmount: 1
        }
      },

      { $sort: { materialName: 1 } }
    ]);

    res.json({ success: true, data: report });

  } catch (error) {
    console.error('Purchase Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase report'
    });
  }
};


exports.salesReport = async (req, res) => {
  try {
    const orgId = req.user.organization.orgId;
    const { fromDate, toDate } = req.query;

    const match = {
      orgId,
      isDeleted: { $ne: true },
      status: 'DELIVERED'
    };

    if (fromDate && toDate) {
      match.orderDate = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }

    const report = await CustomerOrder.aggregate([
      { $match: match },
      { $unwind: '$items' },

      {
        $group: {
          _id: '$items.materialId',
          totalQty: { $sum: '$items.quantity' },
          totalAmount: { $sum: '$items.amount' }
        }
      },

      /* MATERIAL LOOKUP */
      {
        $lookup: {
          from: 'materials',
          let: {
            mid: {
              $cond: [
                { $regexMatch: { input: '$_id', regex: /^[a-f\d]{24}$/i } },
                { $toObjectId: '$_id' },
                null
              ]
            }
          },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$mid'] } } },
            { $project: { name: 1 } }
          ],
          as: 'material'
        }
      },
      { $unwind: '$material' },

      {
        $project: {
          materialId: '$_id',
          materialName: '$material.name',
          totalQty: 1,
          totalAmount: 1
        }
      },

      { $sort: { materialName: 1 } }
    ]);

    res.json({ success: true, data: report });

  } catch (error) {
    console.error('Sales Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales report'
    });
  }
};

