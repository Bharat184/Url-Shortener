import { connectDB } from "../config/db.js";
import redisClient from "../config/redis-client.js";
import { ShortCodes } from "../models/short-code-model.js";
import { UrlHistory } from "../models/url-history-model.js";
import dotenv from "dotenv";

dotenv.config();
connectDB().then(() => {
    console.log("⏳ Expiry worker started...");
    setTimeout(expiryWorker, 0);
});

async function expiryWorker() {
  const now = new Date();

  // Step 1: Expire URLs whose expiry date has passed
  const toExpire = await UrlHistory.find({
    status: "active",
    expiresAt: { $lt: now }
  });

  for (const url of toExpire) {
    // Mark Url as expired
    url.status = "expired";
    await url.save();

    // Move short code → cooldown
    await ShortCodes.updateOne(
      { activeHistoryId: url._id },
      {
        $set: {
          status: "cooldown",
          activeHistoryId: null,
          cooldownUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours cooldown
        }
      }
    );

    await redisClient.del(url.shortCode);
    console.log(`Expired URL: ${url.shortCode}`);
  }
  if (toExpire) {
    setTimeout(expiryWorker, toExpire ? 5000 : 10000);
  }
}
