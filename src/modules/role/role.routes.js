const router = require('express').Router();
const roleController = require('./role.controller');
const authMiddleware = require('../../shared/middlewares/auth.middleware');

router.get('/', authMiddleware, roleController.list);
router.post('/', authMiddleware, roleController.add); // ✅ ADD ROLE

module.exports = router;
