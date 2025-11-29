import { Request, Response } from "express";
import { createShortUrl } from "../services/shorten-service";

export const shortenController = async (req: Request, res: Response) => {
  try {
    const { longUrl, expiresAt } = req.body;
    // @ts-ignore
    const userId = req.user._id; 
    const expiryDate = expiresAt ? new Date(expiresAt + "T23:59:59Z") : new Date();
    const result = await createShortUrl(userId, longUrl, expiresAt);
    return res.redirect(`/dashboard?shortUrl=${result.code}`);
    // return res.status(201).json(result);
  } catch (err) {
    console.error("Shorten Error:", err);
    return res.status(503).json({ error: "Try again later" });
  }
};
