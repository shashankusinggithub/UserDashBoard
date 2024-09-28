import { AuthenticationError, UserInputError } from "apollo-server-express";
import { Request } from "express";
import redis from "./redis";

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  return async (req: Request, user: any | null) => {
    const ip = req.ip;
    const userId = user?.id || "anonymous";

    const ipKey = `rateLimit:ip:${ip}`;
    const userKey = `rateLimit:user:${userId}`;

    const multi = redis.multi();
    multi.incr(ipKey);
    multi.incr(userKey);
    multi.expire(ipKey, Math.floor(options.windowMs / 1000));
    multi.expire(userKey, Math.floor(options.windowMs / 1000));

    const results = await multi.exec();

    if (results) {
      const [ipCount, userCount] = results;

      if (ipCount && (ipCount[1] as number) > options.max) {
        throw new UserInputError("IP rate limit exceeded. Try again later.");
      }
    }

    if (results && results[1] && (results[1][1] as number) > options.max) {
      throw new UserInputError("User rate limit exceeded. Try again later.");
    }
  };
};
