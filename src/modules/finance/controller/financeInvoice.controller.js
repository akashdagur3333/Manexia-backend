const FinanceInvoice = require('../model/financeInvoice.model');

exports.create = async (req, res) => {
  const invoice = await FinanceInvoice.create({
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
  const invoices = await FinanceInvoice.find({
    orgId: req.user.organization.orgId
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: invoices });
};
