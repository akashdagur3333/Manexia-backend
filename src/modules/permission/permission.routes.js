const router = require('express').Router();
const controller = require('./permission.controller');
const auth = require('../../shared/middlewares/auth.middleware');
const permissionGuard = require('../../shared/middlewares/permission.middleware');

router.post(
  '/',
  auth,
  permissionGuard('permission:create'),
  controller.create
);

router.get(
  '/',
  auth,
  permissionGuard('permission:view'),
  controller.list
);

router.put(
  '/:id',
  auth,
  permissionGuard('permission:update'),
  controller.update
);

router.delete(
  '/:id',
  auth,
  permissionGuard('permission:delete'),
  controller.remove
);

module.exports = router;
