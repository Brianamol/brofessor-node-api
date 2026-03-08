// ─── ROUTES ─────────────────────────────────────────────────────────────────
const router = require('express').Router();
const controller = require('./search.controller');
const { searchLimiter } = require('../../middleware/ratelimit.middleware');

router.get('/', searchLimiter, controller.search);
router.get('/suggestions', searchLimiter, controller.suggestions); // Autocomplete

module.exports = router;