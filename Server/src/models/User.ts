import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["candidate", "employer", "hr"],
      default: "candidate",
      index: true,
    },

    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    headline: { type: String, trim: true },
    about: { type: String, trim: true },
    experienceLevel: {
      type: String,
      enum: ["Fresher", "Junior", "Mid", "Senior", "Lead"],
    },
    skills: [{ type: String, trim: true }],
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },

    resumeUrl: { type: String, trim: true },
    resumeDocId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
    resumeFileName: { type: String, trim: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema, "users");
