import { Request, Response } from "express";
import { resolveShortUrl } from "../services/lookup-service";

export const lookupController = async (req: Request, res: Response) => {
  try {
    const code = req.params.code;
    const doc = await resolveShortUrl(code);

    if (!doc) {
      return res.status(404).send("Short URL not found or expired");
    }

    if (doc.status !== "active" || (doc.expiresAt && doc.expiresAt < new Date())) {
      return res.status(410).send("This short URL has expired");
    }

    return res.redirect(doc.longUrl);
  } catch (err) {
    console.error("Lookup Error:", err);
    return res.status(500).send("Server Error");
  }
};
