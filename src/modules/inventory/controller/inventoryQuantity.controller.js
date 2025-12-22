const InventoryQuantity = require('../models/inventoryQuantity.model');

exports.create = async (req, res) => {
  const quantity = await InventoryQuantity.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.json({ success: true, data: quantity });
};

exports.list = async (req, res) => {
  const quantities = await InventoryQuantity.find({
    orgId: req.user.organization.orgId,
    isDeleted: false
  });

  res.json({ success: true, data: quantities });
};

exports.remove = async (req, res) => {
  await InventoryQuantity.findOneAndUpdate(
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

  res.json({ success: true, message: 'Quantity deleted' });
};
