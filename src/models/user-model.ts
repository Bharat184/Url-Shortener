import mongoose from "mongoose";

export interface UserType {
  email: string;
  password?: string; // optional for Google users
  googleId?: number | null; // null for normal auth users
}

export interface UserDocument extends UserType, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<UserDocument>({
  password: { type: String },
  email: { type: String, required: true, unique: true },
  googleId: {
    type: Number,
    unique: true,
    sparse: true, // Unique applies ONLY to non-null
  }
}, {
  timestamps: true
});

export const User = mongoose.model<UserDocument>("User", userSchema);
