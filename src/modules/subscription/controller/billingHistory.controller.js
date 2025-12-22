const BillingHistory = require('../model/billingHistory.model');

exports.create = async (req, res) => {
  const history = await BillingHistory.create(req.body);
  res.json({ success: true, data: history });
};

exports.list = async (req, res) => {
  const history = await BillingHistory.find({ orgId: req.user.organization.orgId });
  res.json({ success: true, data: history });
};
