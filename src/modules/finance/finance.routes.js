const router = require('express').Router();

const account = require('./controller/account.controller');
const payment = require('./controller/payment.controller');
const invoice = require('./controller/financeInvoice.controller');
const authMiddleware = require('../../shared/middlewares/auth.middleware');

// Account
router.post('/account',authMiddleware, account.create);
router.get('/account',authMiddleware, account.list);
router.put('/account/:id',authMiddleware, account.update);
router.delete('/account/:id',authMiddleware, account.remove);

// Payment
router.post('/payment',authMiddleware, payment.create);
router.get('/payment',authMiddleware, payment.list);
router.delete('/payment/:id',authMiddleware, payment.remove);

// Invoice
router.post('/invoice',authMiddleware, invoice.create);
router.get('/invoice',authMiddleware, invoice.list);

module.exports = router;
