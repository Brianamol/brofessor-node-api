const router = require('express').Router();
const controller = require('./payment.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');
const { paymentLimiter } = require('../../middleware/ratelimit.middleware');

// Initiate M-Pesa STK Push (authenticated + rate limited)
router.post('/mpesa/initiate', authenticate, paymentLimiter, controller.initiatePayment);

// ⚠️  M-Pesa callback — PUBLIC, no auth, Safaricom calls this directly
//     Secured by verifying the source and result code internally
router.post('/mpesa/callback', controller.mpesaCallback);

// Query payment status (polling fallback if callback is delayed)
router.get('/mpesa/status/:checkoutRequestId', authenticate, controller.queryStatus);

// Admin: view all payments
router.get('/', authenticate, requireAdmin, controller.getAll);
router.get('/:id', authenticate, controller.getOne);

module.exports = router;