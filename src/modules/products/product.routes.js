const router = require('express').Router();
const controller = require('./product.controller');
const { authenticate, optionalAuth } = require('../../middleware/auth.middleware');
const { requireSeller, requireAdmin } = require('../../middleware/role.middleware');
const { validate, paginationSchema } = require('../../middleware/validate.middleware');
const { uploadProductImages } = require('../../config/cloudinary');
const { createProductSchema, updateProductSchema } = require('./product.validation');

// ── Public routes ──────────────────────────────────────────────────
router.get('/',     optionalAuth, controller.getAll);
router.get('/:id',  optionalAuth, controller.getOne);
router.get('/:id/related', controller.getRelated);

// ── Seller/Admin routes ────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  requireSeller,
  validate(createProductSchema),
  controller.create
);

router.patch(
  '/:id',
  authenticate,
  requireSeller,
  validate(updateProductSchema),
  controller.update
);

router.delete('/:id', authenticate, requireSeller, controller.remove);

// Image management
router.post(
  '/:productId/images',
  authenticate,
  requireSeller,
  uploadProductImages.array('images', 8),
  controller.uploadImages
);

router.delete(
  '/:productId/images/:imageId',
  authenticate,
  requireSeller,
  controller.deleteImage
);

router.patch(
  '/:productId/images/reorder',
  authenticate,
  requireSeller,
  controller.reorderImages
);

// Inventory
router.patch('/:id/inventory', authenticate, requireSeller, controller.updateInventory);

// Admin: approve/feature products
router.patch('/:id/status',   authenticate, requireAdmin, controller.updateStatus);
router.patch('/:id/feature',  authenticate, requireAdmin, controller.toggleFeatured);

module.exports = router;