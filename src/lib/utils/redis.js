
import Redis from "ioredis";

let redis;

if (!global.redis) {
  global.redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
  }); 
}

redis = global.redis;

export { redis };
