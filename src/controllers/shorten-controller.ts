import { Request, Response } from "express";
import { createShortUrl } from "../services/shorten-service";

export const shortenController = async (req: Request, res: Response) => {
  try {
    const { longUrl, expiresInDays } = req.body;
    const userId = req.user._id; // assuming authentication middleware

    let expiresAt: Date | null = null;
    if (expiresInDays) {
      expiresAt = new Date(Date.now() + expiresInDays * 86400000);
    }

    const result = await createShortUrl(userId, longUrl, expiresAt);
    return res.status(201).json(result);
  } catch (err) {
    console.error("Shorten Error:", err);
    return res.status(503).json({ error: "Try again later" });
  }
};
