import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import { Request, Response, NextFunction } from "express";

const redisClient = new Redis({
  host: process.env.HOST,
  port: 6379,
});

export const shortenLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "shorten-limit",
  points: 5,
  duration: 60 * 2,
});

export const signUpLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "signup-limit",
  points: 6,
  duration: 10 * 60,
});

export const limitBy = (limiter: RateLimiterRedis) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await limiter.consume(req.ip);
      next();
    } catch {
      return res.status(429).json({ message: "Too many requests" });
    }
  };
};

export const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rate-limit",
  points: 400,
  duration: 1 * 60,
});

export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
   try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ message: "Too many requests" });
  }
};