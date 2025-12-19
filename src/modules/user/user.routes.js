const router = require('express').Router();
const auth = require('../../shared/middlewares/auth.middleware');
const ctrl = require('./user.controller');

router.get('/', auth, ctrl.list);
module.exports = router;
