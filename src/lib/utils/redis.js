
import { Redis } from '@upstash/redis';

console.log('Upstash URL:', process.env.UPSTASH_REDIS_REST_URL);
console.log('Upstash Token:', process.env.UPSTASH_REDIS_REST_TOKEN ? '***' : 'Not found')

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});


export async function clearUserBlogsCache(userId) {
  const pattern = `userBlogs:${userId}:*`;
  let cursor = 0;

  do {
    // SCAN command with pattern
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: pattern,
      count: 100,  // batch size
    });

    cursor = Number(nextCursor);

    if (keys.length > 0) {
      // Delete keys in batch
      await redis.del(...keys);
      console.log(`Deleted ${keys.length} keys for user ${userId}`);
    }

  } while (cursor !== 0);
}

