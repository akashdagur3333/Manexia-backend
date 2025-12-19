const router = require('express').Router();
router.get('/me', (_, res) => res.json({ active: true }));
module.exports = router;
