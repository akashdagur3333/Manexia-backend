const Warehouse = require('../model/warehouse.model');

exports.create = async (req, res) => {
  const warehouse = await Warehouse.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.json({ success: true, data: warehouse });
};

exports.list = async (req, res) => {
  const warehouses = await Warehouse.find({
    orgId: req.user.organization.orgId,
    isDeleted: false
  });

  res.json({ success: true, data: warehouses });
};

exports.remove = async (req, res) => {
  await Warehouse.findOneAndUpdate(
    { _id: req.params.id, orgId: req.user.organization.orgId },
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

  res.json({ success: true, message: 'Warehouse deleted' });
};
