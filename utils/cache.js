const redisClient = require("../redisClient");

/**
 * Express middleware factory for caching rendered HTML or responses in Redis.
 * @param {number} ttlSeconds - Time-To-Live in seconds
 * @param {Function} keyFn - Function (req) => string generating the cache key
 */
function cacheMiddleware(ttlSeconds, keyFn) {
  return async (req, res, next) => {
    // Skip caching for non-GET requests if applied generally
    if (req.method !== "GET") {
      return next();
    }

    const key = keyFn(req);
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return res.send(cached);
      }
    } catch (err) {
      console.error("Redis GET error:", err);
    }

    // Capture and cache res.send output
    const originalSend = res.send.bind(res);
    res.send = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redisClient.setex(key, ttlSeconds, body).catch((err) => {
          console.error("Redis SET error:", err);
        });
      }
      return originalSend(body);
    };

    next();
  };
}

module.exports = { cacheMiddleware };
