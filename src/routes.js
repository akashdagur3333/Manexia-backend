const express = require('express');
const router = express.Router();

router.use('/auth', require('./modules/auth/auth.routes'));
router.use('/organizations', require('./modules/organization/organization.routes'));
router.use('/users', require('./modules/user/user.routes'));
router.use('/subscriptions', require('./modules/subscription/subscription.routes'));

module.exports = router;
