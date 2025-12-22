const router = require('express').Router();
const { upload } = require('../../shared/middlewares/upload.middleware');
const document = require('./controller/document.controller');

// Upload
router.post('/upload', upload.single('file'), document.upload);

// List
router.get('/', document.list);

// Delete
router.delete('/:id', document.remove);

module.exports = router;
