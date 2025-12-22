const WarehouseOrder = require('../model/warehouseOrder.model');

exports.create = async (req, res) => {
  const order = await WarehouseOrder.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.json({ success: true, data: order });
};

exports.list = async (req, res) => {
  const orders = await WarehouseOrder.find({
    orgId: req.user.organization.orgId
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: orders });
};
