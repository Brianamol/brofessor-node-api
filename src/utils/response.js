/**
 * Standardized API response helpers.
 * All responses follow the same shape so the Angular frontend
 * can rely on a consistent contract.
 *
 * Success: { success: true, data: ..., meta: ... }
 * Error:   { success: false, message: ..., errors: ... }
 */

const sendSuccess = (res, data = null, statusCode = 200, meta = null) => {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const sendCreated = (res, data) => sendSuccess(res, data, 201);

const sendError = (res, message, statusCode = 400, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

const sendNotFound = (res, resource = 'Resource') =>
  sendError(res, `${resource} not found`, 404);

const sendUnauthorized = (res, message = 'Unauthorized') =>
  sendError(res, message, 401);

const sendForbidden = (res, message = 'Forbidden') =>
  sendError(res, message, 403);

const sendServerError = (res, message = 'Internal server error') =>
  sendError(res, message, 500);

/**
 * Build pagination meta for list endpoints.
 * Use in service layer then pass as `meta` to sendSuccess.
 */
const paginationMeta = ({ page, limit, total }) => ({
  page:       parseInt(page),
  limit:      parseInt(limit),
  total,
  totalPages: Math.ceil(total / limit),
  hasNext:    page * limit < total,
  hasPrev:    page > 1,
});

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendServerError,
  paginationMeta,
};