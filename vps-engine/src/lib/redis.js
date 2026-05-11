import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redis;
try {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });
} catch {
  redis = null;
}

export async function getCached(key, ttl = 300) {
  if (!redis) return null;
  try {
    const val = await redis.get(key);
    if (val) return JSON.parse(val);
  } catch {}
  return null;
}

export async function setCache(key, data, ttl = 300) {
  if (!redis) return;
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch {}
}

export async function invalidateCache(pattern) {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch {}
}

export default redis;
