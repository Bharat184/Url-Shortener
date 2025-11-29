import mongoose, { Schema, Document } from "mongoose";

export type ShortCodeStatus = "free" | "active" | "cooldown";

export interface ShortCodeDoc extends Document {
  code: string;         // short code string
  status: ShortCodeStatus;
  activeHistoryId?: mongoose.Types.ObjectId | null;
  cooldownUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const shortCodeSchema = new Schema<ShortCodeDoc>(
  {
    code: { type: String, required: true, unique: true }, // <--- use this
    status: {
      type: String,
      enum: ["free", "active", "cooldown"],
      required: true,
      index: true,
    },
    activeHistoryId: {
      type: Schema.Types.ObjectId,
      ref: "UrlHistory",
      default: null,
    },
    cooldownUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

shortCodeSchema.index({ code: 1 }, { unique: true });

export const ShortCodes = mongoose.model<ShortCodeDoc>(
  "ShortCodes",
  shortCodeSchema
);

// TODO TOMORROW
// KEY LOOKUP HOW DO WE PRECOMPUTE USING Queues or?
// COOLDOWN PERIOD 
// ROTATE UNUSED CODES
// UI FORM TO CREATE
// HISTORY WITH STATS
// CACHING

