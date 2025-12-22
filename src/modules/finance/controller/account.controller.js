const Account = require('../model/account.model');

exports.create = async (req, res) => {
  const account = await Account.create({
    ...req.body,
    currentBalance: req.body.openingBalance || 0,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  res.json({ success: true, data: account });
};

exports.list = async (req, res) => {
  const accounts = await Account.find({
    orgId: req.user.organization.orgId,
    isDeleted: false
  });

  res.json({ success: true, data: accounts });
};

exports.remove = async (req, res) => {
  await Account.findOneAndUpdate(
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

  res.json({ success: true, message: 'Account deleted' });
};
