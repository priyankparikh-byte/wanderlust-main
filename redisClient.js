const Redis = require("ioredis");

const redisClient = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
  retryStrategy(times) {
    if (process.env.NODE_ENV === "test") {
      return null; // don't retry endlessly during automated tests
    }
    return Math.min(times * 100, 2000);
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err.message || err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

module.exports = redisClient;

