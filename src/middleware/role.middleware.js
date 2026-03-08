const { sendForbidden } = require('../utils/response');

// Keycloak realm roles — must match what you configure in Keycloak Admin Console
const ROLES = {
  BUYER:       'buyer',
  SELLER:      'seller',
  ADMIN:       'admin',
  SUPER_ADMIN: 'super-admin',
};

/**
 * requireRole(...roles)
 * Middleware factory — restricts route to users with at least one of the given roles.
 *
 * Usage:
 *   router.post('/products', authenticate, requireRole('seller', 'admin'), controller)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendForbidden(res, 'Authentication required');
    }

    const userRoles = req.user.roles || [];
    const hasRole   = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return sendForbidden(res, `Access denied. Required role: ${roles.join(' or ')}`);
    }

    next();
  };
}

/**
 * requireAdmin
 * Shorthand for requireRole('admin', 'super-admin')
 */
const requireAdmin = requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN);

/**
 * requireSeller
 * Shorthand for requireRole('seller', 'admin', 'super-admin')
 */
const requireSeller = requireRole(ROLES.SELLER, ROLES.ADMIN, ROLES.SUPER_ADMIN);

/**
 * requireOwnerOrAdmin
 * Allows if the authenticated user is the resource owner OR an admin.
 * Pass a function that extracts the owner ID from the request.
 *
 * Usage:
 *   requireOwnerOrAdmin((req) => req.params.userId)
 */
function requireOwnerOrAdmin(getOwnerId) {
  return (req, res, next) => {
    if (!req.user) return sendForbidden(res);

    const ownerId  = getOwnerId(req);
    const isOwner  = req.user.id === ownerId;
    const isAdmin  = req.user.roles.includes(ROLES.ADMIN) || req.user.roles.includes(ROLES.SUPER_ADMIN);

    if (!isOwner && !isAdmin) {
      return sendForbidden(res, 'You do not have permission to access this resource');
    }

    next();
  };
}

module.exports = { requireRole, requireAdmin, requireSeller, requireOwnerOrAdmin, ROLES };