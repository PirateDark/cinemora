import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String, sparse: true },
    discordId: { type: String, sparse: true },
    name: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
