const router = require('express').Router();
const contactUs = require('./controller/contactUs.controller');


router.post('/contact-us', contactUs.create);
router.get('/contact-us', contactUs.list);
router.get('/contact-us/:id', contactUs.getById);
router.put('/contact-us/:id', contactUs.update);
router.delete('/contact-us/:id', contactUs.remove);


module.exports = router;
