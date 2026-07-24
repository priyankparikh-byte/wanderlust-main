const redisClient = require("../redisClient");

/**
 * Invalidates listing cache in Redis.
 * @param {string} [listingId] - ID of specific listing to invalidate. Also invalidates index listing caches.
 */
async function invalidateListingCache(listingId) {
  try {
    const keysToDelete = [];

    if (listingId) {
      keysToDelete.push(`listing:${listingId}`);
    }

    // Stream scan matching keys for listing indexes
    const stream = redisClient.scanStream({
      match: "listings:index:*",
      count: 100,
    });

    stream.on("data", (resultKeys) => {
      if (resultKeys.length > 0) {
        keysToDelete.push(...resultKeys);
      }
    });

    stream.on("end", async () => {
      if (keysToDelete.length > 0) {
        const uniqueKeys = [...new Set(keysToDelete)];
        await redisClient.del(uniqueKeys);
      }
    });
  } catch (err) {
    console.error("Cache invalidation error:", err);
  }
}

module.exports = { invalidateListingCache };
