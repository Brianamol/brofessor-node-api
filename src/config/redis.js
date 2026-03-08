const Redis = require('ioredis');
const logger = require('../utils/logger');

const redis = new Redis({
  host:     process.env.REDIS_HOST || 'localhost',
  port:     parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy(times) {
    if (times > 5) {
      logger.error('Redis: max retries reached, giving up');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

redis.on('connect',   () => logger.info('✅ Redis connected'));
redis.on('error',     (err) => logger.warn('Redis error (non-fatal):', err.message));
redis.on('close',     () => logger.warn('Redis connection closed'));

// Connect (non-blocking — app starts even if Redis is down)
redis.connect().catch(() => {});

// ─────────────────────────────────────────────
//  Helper: Cache-aside pattern
// ─────────────────────────────────────────────

/**
 * Get from cache; if miss, call fetchFn, store result, return it.
 * @param {string} key        - Cache key
 * @param {Function} fetchFn  - Async function to fetch data on cache miss
 * @param {number} ttl        - Time to live in seconds (default 5 min)
 */
async function cacheAside(key, fetchFn, ttl = 300) {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis unavailable — fall through to DB
  }

  const data = await fetchFn();

  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch {
    // Redis unavailable — still return data
  }

  return data;
}

/**
 * Invalidate cache keys by pattern.
 * e.g. invalidatePattern('categories:*')
 */
async function invalidatePattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Non-fatal
  }
}

module.exports = { redis, cacheAside, invalidatePattern };