const rateLimit = require('express-rate-limit');

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 min
const MAX       = parseInt(process.env.RATE_LIMIT_MAX)        || 100;

// General API limiter
const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max:      MAX,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

// Strict limiter for payment initiation
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max:      5,
  message: { success: false, message: 'Too many payment attempts. Please wait a minute.' },
});

// Auth-adjacent limiter (Keycloak handles auth itself, but protect our sync endpoints)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message: { success: false, message: 'Too many authentication requests' },
});

// Search limiter
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      60,
  message: { success: false, message: 'Search rate limit exceeded' },
});

module.exports = { apiLimiter, paymentLimiter, authLimiter, searchLimiter };