import { ShortCodes } from "../models/short-code-model.js";
import { UrlHistory } from "../models/url-history-model.js";
export async function resolveShortUrl(code: string) {
  const key = await ShortCodes.findOne({ code });

  if (!key || !key.activeHistoryId) return null;

  const doc = await UrlHistory.findById(key.activeHistoryId);
  if (!doc || doc.status !== "active") {
    return doc ? doc : null;
  }

  // doc.clickCount++;
  doc.save().catch(console.error);

  return doc;
}
