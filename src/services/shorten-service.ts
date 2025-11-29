import mongoose, { ObjectId } from "mongoose";
import { ShortCodes } from "../models/short-code-model";
import { UrlHistory } from "../models/url-history-model";

export async function createShortUrl(
  userId: mongoose.Types.ObjectId,
  longUrl: string,
  expiresAt?: Date | null
) {
  // Acquire a free key atomically
  const freeKey = await ShortCodes.findOneAndUpdate(
    { status: "free" },
    { status: "active" },
    { new: true }
  );

  if (!freeKey) {
    throw new Error("No keys available. Please retry later.");
  }

  // Create URL history entry
  const history = await UrlHistory.create({
    shortCode: freeKey.code,
    userId,
    longUrl,
    expiresAt: expiresAt || null,
    status: "active",
  });

  // Link active usage
  freeKey.activeHistoryId = history._id;
  await freeKey.save();

  return {
    code: freeKey.code,
    shortUrl: `${process.env.BASE_URL}/${freeKey.code}`,
    expiresAt,
  };
}
