const Customer = require('../model/customer.model');

exports.create = async (req, res) => {
  const customer = await Customer.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.json({ success: true, data: customer });
};

exports.list = async (req, res) => {
  const customers = await Customer.find({
    orgId: req.user.organization.orgId,
    isDeleted: false
  });

  res.json({ success: true, data: customers });
};

exports.remove = async (req, res) => {
  await Customer.findOneAndUpdate(
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

  res.json({ success: true, message: 'Customer deleted' });
};
