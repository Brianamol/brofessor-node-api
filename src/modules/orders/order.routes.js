// ─── ROUTES ─────────────────────────────────────────────────────────
const router = require('express').Router();
const controller = require('./order.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdmin, requireSeller } = require('../../middleware/role.middleware');

// All order routes require authentication
router.use(authenticate);

router.post('/',                controller.create);         // Place an order
router.get('/my',               controller.getMyOrders);    // Buyer: own orders
router.get('/selling',          requireSeller, controller.getSellingOrders); // Seller: received orders
router.get('/:id',              controller.getOne);
router.patch('/:id/cancel',     controller.cancel);         // Buyer can cancel if PENDING
router.patch('/:id/status',     requireSeller, controller.updateStatus);
router.get('/',                 requireAdmin,  controller.getAll); // Admin: all orders

module.exports = router;