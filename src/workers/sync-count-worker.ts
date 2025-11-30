import { createClient } from "redis";
import { UrlHistory } from "../models/url-history-model";
import { connectDB } from "../config/db";
import dotenv from "dotenv";

dotenv.config();
await connectDB();

const subscriber = createClient();
const redisClient = createClient();

await subscriber.connect();
await redisClient.connect();

const CLICK_THRESHOLD = 3; // tune as per load

console.log("Worker listening for click events...");

await subscriber.subscribe("click-events", async (shortCode) => {
  try {
    const key = `clicks:${shortCode}`;
    const count = await redisClient.get(key);
    if (!count) return;

    const num = parseInt(count.toString());

    if (num >= CLICK_THRESHOLD) {
      console.log(`Syncing ${num} clicks for ${shortCode} to DB`);

      await UrlHistory.updateOne(
        { shortCode },
        { $inc: { clickCount: num } }
      );

      // Reset only after DB success
      await redisClient.del(key);
    }
  } catch (err) {
    console.error("Worker Error:", err);
  }
});
