const router = require('express').Router();
const ctrl = require('./organization.controller');
const auth = require('../../shared/middlewares/auth.middleware');

router.get('/', auth, ctrl.getMyOrg);
module.exports = router;
