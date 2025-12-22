const Invoice = require('../model/subscriptionInvoice.model');

exports.create = async (req, res) => {
  const invoice = await Invoice.create(req.body);
  res.json({ success: true, data: invoice });
};

exports.list = async (req, res) => {
  const invoices = await Invoice.find({ orgId: req.user.organization.orgId });
  res.json({ success: true, data: invoices });
};
