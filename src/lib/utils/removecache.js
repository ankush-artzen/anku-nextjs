import { redis } from "@/lib/utils/redis";

export async function invalidateBlogCache(userId) {
  try {
    // Invalidate public blogs cache
    const publicKeys = await redis.keys("blogs:public:*");
    if (publicKeys.length) await redis.del(...publicKeys);

    // Invalidate user blogs cache
    if (userId) {
      const userKeys = await redis.keys(`blogs:user:${userId}:*`);
      if (userKeys.length) await redis.del(...userKeys);
    }

    console.log("Cache invalidated");
  } catch (err) {
    console.error("Cache invalidation error", err);
  }
}
