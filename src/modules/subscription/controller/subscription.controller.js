const Subscription = require('../model/subscription.model');

exports.create = async (req, res) => {
  const subscription = await Subscription.create(req.body);
  res.json({ success: true, data: subscription });
};

exports.list = async (req, res) => {
  const subscriptions = await Subscription.find({ orgId: req.user.organization.orgId });
  res.json({ success: true, data: subscriptions });
};
