const Subscription = require('../model/subscription.model');

module.exports = async function subscriptionMiddleware(req, res, next) {
  try {
    const orgId = req.user.organization.orgId;

    const subscription = await Subscription.findOne({
      orgId,
      status: 'ACTIVE',
      endDate: { $gte: new Date() }
    });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Subscription expired or inactive'
      });
    }

    req.subscription = subscription;
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Subscription validation failed'
    });
  }
};
