const CustomerInvoice = require('../model/customerInvoice.model');

exports.create = async (req, res) => {
  const invoice = await CustomerInvoice.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.json({ success: true, data: invoice });
};

exports.list = async (req, res) => {
  const invoices = await CustomerInvoice.find({
    orgId: req.user.organization.orgId
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: invoices });
};
