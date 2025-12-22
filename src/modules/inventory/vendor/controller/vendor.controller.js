const Vendor = require('../model/vendor.model');

exports.create = async (req, res) => {
  const vendor = await Vendor.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.json({ success: true, data: vendor });
};

exports.list = async (req, res) => {
  const vendors = await Vendor.find({
    orgId: req.user.organization.orgId,
    isDeleted: false
  });

  res.json({ success: true, data: vendors });
};

exports.remove = async (req, res) => {
  await Vendor.findOneAndUpdate(
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

  res.json({ success: true, message: 'Vendor deleted' });
};
