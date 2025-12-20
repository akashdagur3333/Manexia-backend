const router = require('express').Router();
const roleController = require('./role.controller');
const authMiddleware = require('../../shared/middlewares/auth.middleware');

router.get('/', authMiddleware, roleController.list);
router.post('/', authMiddleware, roleController.add); 
router.put('/:id', authMiddleware, roleController.update);
router.delete('/:id', authMiddleware, roleController.delete); 
module.exports = router;
