const router = require('express').Router();

const account = require('./controller/account.controller');
const payment = require('./controller/payment.controller');
const invoice = require('./controller/financeInvoice.controller');

// Account
router.post('/account', account.create);
router.get('/account', account.list);
router.delete('/account/:id', account.remove);

// Payment
router.post('/payment', payment.create);
router.get('/payment', payment.list);

// Invoice
router.post('/invoice', invoice.create);
router.get('/invoice', invoice.list);

module.exports = router;
