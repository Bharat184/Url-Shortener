import { createClient } from "redis";
import { UrlHistory } from "../models/url-history-model.js";
import { connectDB } from "../config/db.js";
import dotenv from "dotenv";
import { COUNTER_HASH_KEY } from "../constants/index.js";
import mongoose from "mongoose";

dotenv.config();
await connectDB();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

await redisClient.connect();

async function flushToDatabase() {
  const TEMP_KEY = `${COUNTER_HASH_KEY}_temp_${Date.now()}`;

  try {
    // 1. ATOMIC RENAME: Move current counts to a temp key
    // This allows new clicks to keep flowing into the main COUNTER_HASH_KEY
    const exists = await redisClient.exists(COUNTER_HASH_KEY);
    if (!exists) return;

    await redisClient.rename(COUNTER_HASH_KEY, TEMP_KEY);

    // 2. FETCH from temp key
    const allCounters = await redisClient.hGetAll(TEMP_KEY);
    const shortCodes = Object.keys(allCounters);

    if (shortCodes.length === 0) return;

    console.log(`Flushing ${shortCodes.length} items to DB...`);

    // 3. BULK UPDATE: One single query to MongoDB instead of multiple
    const operations = shortCodes.map((shortCode) => ({
      updateOne: {
        filter: { shortCode, status: 'active' },
        update: { $inc: { clickCount: parseInt(allCounters[shortCode], 10) } },
      },
    }));


    await UrlHistory.bulkWrite(operations);

    // 4. CLEANUP: Delete the temp key
    await redisClient.del(TEMP_KEY);
    console.log("Sync complete.");
  } catch (err) {
    console.error("Flush Error:", err);
    // If it fails, the data is still in TEMP_KEY; you can retry later.
  } finally {
    await Promise.all([redisClient.quit(), mongoose.connection.close()]);

    console.log("Connections closed. Exiting now.");

    // 2. Now it is safe to exit
    process.exit();
  }
}

flushToDatabase();
