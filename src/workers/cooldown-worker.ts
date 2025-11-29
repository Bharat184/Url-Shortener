import { connectDB } from "../config/db";
import { ShortCodes } from "../models/short-code-model";
import dotenv from "dotenv";

dotenv.config();
connectDB().then(() => {
    console.log("♻️ Cooldown worker started...");
    setTimeout(cooldownWorker, 0);
});

async function cooldownWorker() {
  const now = new Date();
  console.log('yes');

  const readyToRelease = await ShortCodes.find({
    status: "cooldown",
    cooldownUntil: { $lt: now }
  });

  for (const code of readyToRelease) {
    code.status = "free";
    code.cooldownUntil = null;
    await code.save();

    console.log(`Released code: ${code.code}`);
  }
  setTimeout(cooldownWorker, readyToRelease ? 5000 : 10000);
}


