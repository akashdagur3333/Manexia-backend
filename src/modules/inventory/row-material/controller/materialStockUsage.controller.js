const MaterialStock = require('../models/materialStock.model');
const MaterialStockUsage = require('../models/materialStockUsage.model');

exports.create = async (req, res) => {
  const { materialId, warehouseId, quantity, type } = req.body;

  await MaterialStock.findOneAndUpdate(
    { materialId, warehouseId, orgId: req.user.organization.orgId },
    {
      $inc: { availableQty: type === 'IN' ? quantity : -quantity }
    }
  );

  const usage = await MaterialStockUsage.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.json({ success: true, data: usage });
};

exports.list = async (req, res) => {
  const usageList = await MaterialStockUsage.find({
    orgId: req.user.organization.orgId
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: usageList });
};
