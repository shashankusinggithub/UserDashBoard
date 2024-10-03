import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const serializeForRedis = (obj: any): any => {
  return JSON.stringify(obj, (key, value) => {
    if (value instanceof Date) {
      return { type: "date", value: value.toISOString() };
    }
    return value;
  });
};

// Helper function to deserialize dates
const deserializeFromRedis = (str: string): any => {
  return JSON.parse(str, (key, value) => {
    if (typeof value === "object" && value !== null && value.type === "date") {
      return new Date(value.value);
    }
    return value;
  });
};

export const setCache = async (
  key: string,
  value: any,
  expirationInSeconds: number = 3600
) => {
  await redis.set(key, JSON.stringify(value), "EX", expirationInSeconds);
};

export const getCache = async (key: string) => {
  const cachedValue = await redis.get(key);
  return cachedValue ? JSON.parse(cachedValue) : null;
};

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

export default redis;
