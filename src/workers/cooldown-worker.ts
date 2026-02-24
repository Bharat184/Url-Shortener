import { connectDB } from "../config/db.js";
import { ShortCodes } from "../models/short-code-model.js";
import dotenv from "dotenv";

dotenv.config();
connectDB().then(() => {
    console.log("♻️ Cooldown worker started...");
    setTimeout(cooldownWorker, 0);
});
const timeoutTime = 20 * 60 * 1000;

async function cooldownWorker() {
  const now = new Date();

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
  setTimeout(cooldownWorker, timeoutTime);
}


