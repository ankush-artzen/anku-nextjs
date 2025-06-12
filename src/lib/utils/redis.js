
import { Redis } from '@upstash/redis';

console.log('Upstash URL:', process.env.UPSTASH_REDIS_REST_URL);
console.log('Upstash Token:', process.env.UPSTASH_REDIS_REST_TOKEN ? '***' : 'Not found')

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

