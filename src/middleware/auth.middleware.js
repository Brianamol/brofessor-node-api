const { verifyToken, extractRoles } = require('../config/keycloak');
const { sendUnauthorized, sendForbidden } = require('../utils/response');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────
//  authenticate
//  Validates the Bearer JWT from Keycloak.
//  Attaches decoded user info to req.user.
//  Use on any route that requires login.
// ─────────────────────────────────────────────

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return sendUnauthorized(res, 'Authorization header missing or invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await verifyToken(token);

    req.user = {
      id:        decoded.sub,                    // Keycloak user UUID
      email:     decoded.email,
      username:  decoded.preferred_username,
      firstName: decoded.given_name,
      lastName:  decoded.family_name,
      roles:     extractRoles(decoded),
      token:     decoded,                        // Full token in case extra claims are needed
    };

    next();
  } catch (error) {
    logger.warn(`Auth failed: ${error.message} | IP: ${req.ip}`);

    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Session expired — please log in again');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid token');
    }
    return sendUnauthorized(res, 'Authentication failed');
  }
}

// ─────────────────────────────────────────────
//  optionalAuth
//  Like authenticate but doesn't block if no token.
//  Use on public routes that show extra info when logged in
//  (e.g. product page showing if item is wishlisted).
// ─────────────────────────────────────────────

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await verifyToken(token);
    req.user = {
      id:       decoded.sub,
      email:    decoded.email,
      username: decoded.preferred_username,
      roles:    extractRoles(decoded),
      token:    decoded,
    };
  } catch {
    req.user = null;
  }

  next();
}

module.exports = { authenticate, optionalAuth };