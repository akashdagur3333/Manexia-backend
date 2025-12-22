const InventoryCategory = require('../models/inventoryCategory.model');

exports.create = async (req, res) => {
  const category = await InventoryCategory.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.json({ success: true, data: category });
};

exports.list = async (req, res) => {
  const categories = await InventoryCategory.find({
    orgId: req.user.organization.orgId,
    isDeleted: false
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: categories });
};

exports.remove = async (req, res) => {
  await InventoryCategory.findOneAndUpdate(
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

  res.json({ success: true, message: 'Category deleted' });
};
