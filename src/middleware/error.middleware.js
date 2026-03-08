const logger = require('../utils/logger');

/**
 * 404 handler — catches any request that didn't match a route.
 * Mount AFTER all routes.
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Global error handler.
 * Catches errors passed via next(err) from any route or middleware.
 * Mount LAST in app.js.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || err.status || 500;
  let message    = err.message || 'Internal server error';

  // ── Prisma errors ──────────────────────────────────
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'field';
    message = `A record with this ${field} already exists`;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Invalid reference — related record does not exist';
  }

  // ── Multer errors ──────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large. Maximum size is 5MB per image';
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files. Maximum 8 images per product';
  }

  // ── Validation errors ──────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  // ── Log server errors (don't log expected 4xx client errors) ──
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} — ${statusCode}:`, err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} — ${statusCode}: ${message}`);
  }

  const response = { success: false, message };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * AppError — throw this anywhere to send a structured error response.
 *
 * Usage:
 *   throw new AppError('Product not found', 404);
 *   throw new AppError('Cannot delete a category with active products', 400);
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, notFoundHandler, AppError };