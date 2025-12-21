const router = require('express').Router();
const auth = require('../../shared/middlewares/auth.middleware');
const ctrl = require('./plan.controller');

router.post('/', auth, ctrl.create);
router.get('/', auth, ctrl.list);
router.get('/:id', auth, ctrl.getById);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
