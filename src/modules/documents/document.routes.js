const router = require('express').Router();
const controller = require('./document.controller');
const auth = require('../../shared/middlewares/auth.middleware');

router.post('/upload', auth, controller.upload);
router.get('/', auth, controller.list);
router.get('/:id', auth, controller.view);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.remove);

module.exports = router;
