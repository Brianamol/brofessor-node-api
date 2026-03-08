// ─── ROUTES ─────────────────────────────────────────────────────────────────
const router = require('express').Router();
const controller = require('./user.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdmin, requireOwnerOrAdmin } = require('../../middleware/role.middleware');
const { uploadAvatar } = require('../../config/cloudinary');

router.get('/me',             authenticate, controller.getMe);
router.patch('/me',           authenticate, controller.updateMe);
router.post('/me/avatar',     authenticate, uploadAvatar.single('avatar'), controller.uploadAvatar);
router.post('/me/sync',       authenticate, controller.syncFromKeycloak); // Called on first login

// Addresses
router.get('/me/addresses',   authenticate, controller.getAddresses);
router.post('/me/addresses',  authenticate, controller.addAddress);
router.patch('/me/addresses/:id', authenticate, controller.updateAddress);
router.delete('/me/addresses/:id', authenticate, controller.deleteAddress);

// Wishlist
router.get('/me/wishlist',         authenticate, controller.getWishlist);
router.post('/me/wishlist/:productId', authenticate, controller.addToWishlist);
router.delete('/me/wishlist/:productId', authenticate, controller.removeFromWishlist);

// Seller profile
router.post('/me/seller-profile', authenticate, controller.createSellerProfile);
router.patch('/me/seller-profile', authenticate, controller.updateSellerProfile);

// Admin
router.get('/', authenticate, requireAdmin, controller.getAll);
router.get('/:id', authenticate, requireAdmin, controller.getOne);
router.patch('/:id/status', authenticate, requireAdmin, controller.updateStatus);

module.exports = router;