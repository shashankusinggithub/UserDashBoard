import { PrismaClient } from "@prisma/client";
import { Request } from "express";
import { verifyToken } from "./services/authService";
import redis from "./utils/redis";
import Redis from "ioredis";
import { createRateLimiter } from "./utils/rateLimiter";
const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  redis: Redis;
  user: any | null;
  rateLimiter: (options: { windowMs: number; max: number }) => Promise<void>;
}

export const createContext = ({ req }: { req: Request }): Context => {
  const token = req.headers.authorization || "";
  let user = null;

  if (token) {
    try {
      user = verifyToken(token.replace("Bearer ", ""));
    } catch (error) {
      // Token verification failed, but we'll continue without a user
      console.error("Token verification failed:", error);
    }
  }

  const rateLimiter = (options: { windowMs: number; max: number }) => {
    const limiter = createRateLimiter(options);
    return limiter(req, user);
  };

  return { prisma, redis, user, rateLimiter };
};
