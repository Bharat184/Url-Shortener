import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import { Request, Response, NextFunction } from "express";

const redisClient = new Redis({
  host: "localhost",
  port: 6379,
});

export const shortenLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "shorten-limit",
  points: 10,
  duration: 60 * 2,
});

export const signUpLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "signup-limit",
  points: 2,
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

export const ratelimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "signup-limit",
  points: 50,
  duration: 1 * 60,
});

const exemptRoutes = ["/:code"];
export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  console.log("Method:", req.method, "Path:", req.path, "Route:", req.route?.path);
  if (req.route && exemptRoutes.includes(req.route.path)) {
    return next();
  }

  try {
    await ratelimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ message: "Too many requests" });
  }
};