import { Request, Response } from "express";
import { resolveShortUrl } from "../services/lookup-service";
import redisClient from "../config/redis-client";

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

    // if (!originalUrl) {
    //   return res.status(404).send("Short URL not found or expired");
    // }

     // Increment counter in Redis
    const count = await redisClient.incr(`clicks:${code}`);

    // Publish only shortId - no heavy data
    await redisClient.publish("click-events", code);

    return res.redirect(originalUrl.toString());
  } catch (err) {
    console.error("Lookup Error:", err);
    return res.status(500).send("Server Error");
  }
};
