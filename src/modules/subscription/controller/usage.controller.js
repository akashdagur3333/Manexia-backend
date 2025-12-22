const Usage = require('../model/usage.model');

exports.addUsage = async (req, res) => {
  const usage = await Usage.findOneAndUpdate(
    { orgId: req.user.organization.orgId, feature: req.body.feature },
    { $inc: { used: req.body.used } },
    { upsert: true, new: true }
  );

  res.json({ success: true, data: usage });
};

exports.list = async (req, res) => {
  const usage = await Usage.find({ orgId: req.user.organization.orgId });
  res.json({ success: true, data: usage });
};
