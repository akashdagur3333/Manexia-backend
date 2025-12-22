const express = require('express');
const router = express.Router();

router.use('/auth', require('./modules/auth/auth.routes'));
router.use('/roles', require('./modules/role/role.routes'));
router.use('/permissions', require('./modules/permission/permission.routes'));
router.use('/organizations', require('./modules/organization/organization.routes'));
router.use('/inventory', require('./modules/inventory/inventory.routes'));
router.use('/finance', require('./modules/finance/finance.routes'));
router.use('/hr', require('./modules/finance/finance.routes'));
router.use('/documents', require('./modules/documents/document.routes'));
router.use('/users', require('./modules/user/user.routes'));
router.use('/subscriptions', require('./modules/subscription/subscription.routes'));

module.exports = router;
