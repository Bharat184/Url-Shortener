import { Request, Response } from "express";
import { resolveShortUrl } from "../services/lookup-service";

export const lookupController = async (req: Request, res: Response) => {
  try {
    const code = req.params.code;
    const longUrl = await resolveShortUrl(code);

    if (!longUrl) {
      return res.status(404).send("Short URL not found or expired");
    }

    return res.redirect(longUrl);
  } catch (err) {
    console.error("Lookup Error:", err);
    return res.status(500).send("Server Error");
  }
};
