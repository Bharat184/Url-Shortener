import mongoose, { Schema, Document } from "mongoose";

export type UrlHistoryStatus = "active" | "expired";

export interface UrlHistoryDoc extends Document {
  shortCode: string; // ref to ShortCodes._id
  userId: mongoose.Types.ObjectId;
  longUrl: string;
  status: UrlHistoryStatus;
  clickCount: number;
  expiresAt: Date | null;
}

const urlHistorySchema = new Schema<UrlHistoryDoc>(
  {
    shortCode: {
      type: String,
      ref: "ShortCodes",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    longUrl: { type: String, required: true },

    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
      index: true,
    },

    clickCount: { type: Number, default: 0 },

    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

urlHistorySchema.index({ shortCode: 1, status: 1 });

export const UrlHistory = mongoose.model<UrlHistoryDoc>(
  "UrlHistory",
  urlHistorySchema
);
