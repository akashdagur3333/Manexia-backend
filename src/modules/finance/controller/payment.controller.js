const Payment = require('../model/payment.model');
const Account = require('../model/account.model');

exports.create = async (req, res) => {
  const payment = await Payment.create({
    ...req.body,
    orgId: req.user.organization.orgId,
    createdBy: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });

  // Update account balance
  await Account.findOneAndUpdate(
    { _id: req.body.accountId, orgId: req.user.organization.orgId },
    {
      $inc: {
        currentBalance: req.body.type === 'IN'
          ? req.body.amount
          : -req.body.amount
      }
    }
  );

  res.json({ success: true, data: payment });
};

exports.list = async (req, res) => {
  const payments = await Payment.find({
    orgId: req.user.organization.orgId
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: payments });
};
