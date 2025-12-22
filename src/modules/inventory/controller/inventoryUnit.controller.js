const InventoryUnit = require('../models/inventoryUnit.model');

exports.create = async (req, res) => {
  const unit = await InventoryUnit.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.json({ success: true, data: unit });
};

exports.list = async (req, res) => {
  const units = await InventoryUnit.find({
    orgId: req.user.organization.orgId,
    isDeleted: false
  });

  res.json({ success: true, data: units });
};

exports.remove = async (req, res) => {
  await InventoryUnit.findOneAndUpdate(
    {
      _id: req.params.id,
      orgId: req.user.organization.orgId
    },
    {
      isDeleted: true,
      deletedBy: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        deletedAt: new Date()
      }
    }
  );

  res.json({ success: true, message: 'Unit deleted' });
};
