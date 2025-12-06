import { Request, Response } from "express";
import { createShortUrl } from "../services/shorten-service.js";

export const shortenController = async (req: Request, res: Response) => {
  try {
    const { longUrl, expiresAt } = req.body;
    // @ts-ignore
    const userId = req.user._id; 
    const expiryDate = expiresAt ? new Date(expiresAt + "T23:59:59Z") : new Date();
    const result = await createShortUrl(userId, longUrl, expiryDate);
    return res.redirect(`/dashboard?shortUrl=${result.code}`);
  } catch (err) {
    req.flash("error", err.name);
    return res.redirect('/');
  }
};
