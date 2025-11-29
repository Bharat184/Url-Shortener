import { ShortCodes } from "../models/short-code-model";
import { UrlHistory } from "../models/url-history-model";
export async function resolveShortUrl(code: string) {
  const key = await ShortCodes.findOne({ code, status: "active" });

  if (!key || !key.activeHistoryId) return null;

  const doc = await UrlHistory.findById(key.activeHistoryId);
  if (!doc || doc.status !== "active") return null;

  doc.clickCount++;
  doc.save().catch(console.error);

  return doc.longUrl;
}
