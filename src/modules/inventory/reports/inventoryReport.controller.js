const Material = require('../row-material/models/material.model');
const MaterialStock = require('../row-material/models/materialStock.model');
const VendorOrder = require('../vendor/model/vendorOrder.model');
const CustomerOrder = require('../customer/model/customerOrder.model');

/**
 * 📊 Current Stock Report
 */
exports.currentStock = async (req, res) => {
  const stockReport = await MaterialStock.aggregate([
    {
      $match: {
        orgId: req.user.organization.orgId,
        isDeleted: false
      }
    },
    {
      $lookup: {
        from: 'materials',
        localField: 'materialId',
        foreignField: '_id',
        as: 'material'
      }
    },
    { $unwind: '$material' },
    {
      $project: {
        materialName: '$material.name',
        warehouseId: 1,
        availableQty: 1,
        reservedQty: 1
      }
    }
  ]);

  res.json({ success: true, data: stockReport });
};

/**
 * 📦 Purchase Report (Vendor Orders)
 */
exports.purchaseReport = async (req, res) => {
  const { fromDate, toDate } = req.query;

  const filter = {
    orgId: req.user.organization.orgId
  };

  if (fromDate && toDate) {
    filter.createdAt = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate)
    };
  }

  const purchases = await VendorOrder.find(filter)
    .sort({ createdAt: -1 });

  res.json({ success: true, data: purchases });
};

/**
 * 💰 Sales Report (Customer Orders)
 */
exports.salesReport = async (req, res) => {
  const { fromDate, toDate } = req.query;

  const filter = {
    orgId: req.user.organization.orgId
  };

  if (fromDate && toDate) {
    filter.createdAt = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate)
    };
  }

  const sales = await CustomerOrder.find(filter)
    .sort({ createdAt: -1 });

  res.json({ success: true, data: sales });
};
