require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const logger = require('./utils/logger');

// Route imports
const categoryRoutes = require('./modules/categories/category.routes');
const productRoutes  = require('./modules/products/product.routes');
const orderRoutes    = require('./modules/orders/order.routes');
const paymentRoutes  = require('./modules/payments/payment.routes');
const userRoutes     = require('./modules/users/user.routes');
const reviewRoutes   = require('./modules/reviews/review.routes');
const searchRoutes   = require('./modules/search/search.routes');

const app  = express();
const PORT = process.env.PORT || 3000;
const API  = process.env.API_PREFIX || '/api/v1';

// ─────────────────────────────────────────────
//  SECURITY & PARSING MIDDLEWARE
// ─────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow Cloudinary images
}));

app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:4200').split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────────
//  LOGGING
// ─────────────────────────────────────────────

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
  }));
}

// ─────────────────────────────────────────────
//  RATE LIMITING
// ─────────────────────────────────────────────

app.use(`${API}/`, apiLimiter);

// ─────────────────────────────────────────────
//  HEALTH CHECK  (no auth required)
// ─────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ─────────────────────────────────────────────
//  API ROUTES
// ─────────────────────────────────────────────

app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/products`,   productRoutes);
app.use(`${API}/orders`,     orderRoutes);
app.use(`${API}/payments`,   paymentRoutes);
app.use(`${API}/users`,      userRoutes);
app.use(`${API}/reviews`,    reviewRoutes);
app.use(`${API}/search`,     searchRoutes);

// ─────────────────────────────────────────────
//  ERROR HANDLING  (must be last)
// ─────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─────────────────────────────────────────────
//  START SERVER
// ─────────────────────────────────────────────

app.listen(PORT, () => {
  logger.info(`🚀 Marketplace API running on port ${PORT} [${process.env.NODE_ENV}]`);
  logger.info(`📦 API base: ${API}`);
});

module.exports = app; 