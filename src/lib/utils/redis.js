import { Redis } from '@upstash/redis';

console.log('Upstash URL:', process.env.UPSTASH_REDIS_REST_URL);
console.log('Upstash Token:', process.env.UPSTASH_REDIS_REST_TOKEN ? '***' : 'Not found')

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// import Redis from "ioredis";

// let redis;

// if (!global.redis) {
//   global.redis = new Redis({
//     host: "127.0.0.1", // or 'localhost'
//     port: 6379,
//   }); // default: localhost:6379
// }

// redis = global.redis;

// export { redis };
