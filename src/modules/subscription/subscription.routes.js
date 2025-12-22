const router = require('express').Router();
const ctrl = require('./controller/plan.controller');
const subscription = require('./controller/subscription.controller');
const usage = require('./controller/usage.controller');
const invoice = require('./controller/subscriptionInvoice.controller');
const billing = require('./controller/billingHistory.controller');
const auth = require('../../shared/middlewares/auth.middleware');


// Subscription
router.post('/', subscription.create);
router.get('/', subscription.list);

// Usage
router.post('/usage', usage.addUsage);
router.get('/usage', usage.list);

// Invoice
router.post('/invoice', invoice.create);
router.get('/invoice', invoice.list);

// Billing History
router.post('/billing-history', billing.create);
router.get('/billing-history', billing.list);


router.post('/plans/', auth, ctrl.create);
router.get('/plans/', auth, ctrl.list);
router.get('/plans/:id', auth, ctrl.getById);
router.put('/plans/:id', auth, ctrl.update);
router.delete('/plans/:id', auth, ctrl.remove);

module.exports = router;
