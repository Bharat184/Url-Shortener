import { Request, Response } from "express";
import { resolveShortUrl } from "../services/lookup-service.js";
import redisClient from "../config/redis-client.js";

export const lookupController = async (req: Request, res: Response) => {
  try {
    const code = req.params.code;
    let originalUrl = await redisClient.get(code);
    if (!originalUrl) {
      const doc = await resolveShortUrl(code);
      if (!doc || doc.status !== "active" || (doc.expiresAt && doc.expiresAt < new Date())) {
        return res.status(410).send("This short URL has expired");
      }
      originalUrl = doc.longUrl;

      // Store in cache for future hits
      await redisClient.set(doc.shortCode, originalUrl);
    }

     // Increment counter in Redis
    const count = await redisClient.incr(`clicks:${code}`);

    // Publish only shortId - no heavy data
    await redisClient.publish("click-events", code);
    return res.redirect(originalUrl.toString());
  } catch (err) {
    req.flash("error", err.name);
    return res.redirect('/');
  }
};
