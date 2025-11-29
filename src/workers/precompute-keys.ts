import mongoose from "mongoose";
import { ShortCodes } from "../models/short-code-model";
import { generateShortCode } from "../utils/generate-short-code";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;
const MIN_POOL_SIZE = 200;
const BATCH_SIZE = 20;

async function ensureConnection() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  }
}

async function getFreeKeyCount() {
  return ShortCodes.countDocuments({ status: "free" });
}

async function insertBatch(count: number) {
  const codes = new Set<string>();

  while (codes.size < count) {
    codes.add(generateShortCode(7));
  }

  const docs = [...codes].map(code => ({
    code,
    status: "free",
  }));

  try {
    await ShortCodes.insertMany(docs, { ordered: false });
    console.log(`Inserted batch: ${docs.length}`);
  } catch (err: any) {
    if (err.code !== 11000) console.error(err);
    // Duplicate errors ignored automatically
  }
}

async function refillPool() {
  await ensureConnection();

  const freeCount = await getFreeKeyCount();
  console.log("Current free key count:", freeCount);

  if (freeCount >= MIN_POOL_SIZE) {
    console.log("Pool sufficient. No refill needed.");
    return;
  }

  const need = MIN_POOL_SIZE - freeCount;
  const batches = Math.ceil(need / BATCH_SIZE);

  console.log(`Need ${need} keys → ${batches} batch(es)`);

  for (let i = 0; i < batches; i++) {
    const amount = Math.min(BATCH_SIZE, need - i * BATCH_SIZE);
    await insertBatch(amount);
  }
}

refillPool().then(() => process.exit(0));
