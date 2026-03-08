const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────
//  Keycloak JWKS client
//  Fetches Keycloak's public keys automatically to validate JWTs.
//  No manual key management needed — Keycloak rotates keys and
//  this client fetches them dynamically with caching.
// ─────────────────────────────────────────────

const KEYCLOAK_URL   = process.env.KEYCLOAK_URL;
const REALM          = process.env.KEYCLOAK_REALM;

const jwksUri = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`;

const client = jwksClient({
  jwksUri,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,  // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

/**
 * Get the signing key from Keycloak's JWKS endpoint.
 */
function getSigningKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      logger.error('Failed to get Keycloak signing key:', err.message);
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Verify a JWT access token issued by Keycloak.
 * Returns the decoded payload or throws an error.
 */
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getSigningKey,
      {
        algorithms: ['RS256'],
        issuer: `${KEYCLOAK_URL}/realms/${REALM}`,
        audience: process.env.KEYCLOAK_CLIENT_ID,
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}

/**
 * Extract roles from Keycloak token.
 * Keycloak puts realm roles in: token.realm_access.roles
 * Client roles in: token.resource_access[clientId].roles
 */
function extractRoles(decodedToken) {
  const realmRoles = decodedToken?.realm_access?.roles || [];
  const clientRoles = decodedToken?.resource_access?.[process.env.KEYCLOAK_CLIENT_ID]?.roles || [];
  return [...new Set([...realmRoles, ...clientRoles])];
}

module.exports = { verifyToken, extractRoles };