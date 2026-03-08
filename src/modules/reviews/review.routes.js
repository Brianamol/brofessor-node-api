// ─── ROUTES ─────────────────────────────────────────────────────────────────
const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');
const controller = require('./review.controller');

router.get('/product/:productId',   controller.getForProduct);    // Public
router.post('/product/:productId',  authenticate, controller.create);
router.patch('/:id',                authenticate, controller.update);
router.delete('/:id',               authenticate, controller.remove);
router.patch('/:id/approve',        authenticate, requireAdmin, controller.approve);

module.exports = router;