const router = require('express').Router();
const controller = require('./category.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createCategorySchema, updateCategorySchema } = require('./category.validation');

// ── Public routes ──────────────────────────────────────────────────
router.get('/',              controller.getAll);        // Full category tree
router.get('/flat',          controller.getFlat);       // Flat list (for admin dropdowns)
router.get('/featured',      controller.getFeatured);   // Featured categories (homepage)
router.get('/:id',           controller.getOne);        // Single category + children
router.get('/:id/products',  controller.getCategoryProducts); // Products in a category

// ── Admin-only routes ──────────────────────────────────────────────
router.post('/',     authenticate, requireAdmin, validate(createCategorySchema), controller.create);
router.patch('/:id', authenticate, requireAdmin, validate(updateCategorySchema), controller.update);
router.delete('/:id',authenticate, requireAdmin, controller.remove);

// Reorder categories (drag-and-drop in admin)
router.patch('/reorder', authenticate, requireAdmin, controller.reorder);

module.exports = router;