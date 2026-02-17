import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
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
    resumeDocId: { type: Schema.Types.ObjectId, ref: "Document" },
    resumeFileName: { type: String, trim: true },

    resumePublicId: { type: String, trim: true, index: true },
    resumeFormat: { type: String, trim: true, default: "pdf" },
    resumeResourceType: {
      type: String,
      enum: ["raw", "image", "video"],
      default: "raw",
    },

    preferences: {
      jobTypes: [{ type: String }],
      workModes: [{ type: String }],
      locations: [{ type: String }],
      salary: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: "USD" },
      },
      relocation: { type: Boolean, default: false },
      preferences: {
        jobTypes: [{ type: String }],
        workModes: [{ type: String }],
        locations: [{ type: String }],
        salary: {
          min: { type: Number },
          max: { type: Number },
          currency: { type: String, default: "USD" },
        },
        relocation: { type: Boolean, default: false },
      },

      settings: {
        emailNotifications: { type: Boolean, default: true },
        productUpdates: { type: Boolean, default: true },
        marketingEmails: { type: Boolean, default: false },
        desktopNotifications: { type: Boolean, default: false },
        weeklySummary: { type: Boolean, default: true },
        defaultLanding: { type: String, default: "dashboard" },
        theme: { type: String, default: "system" },
      },
    },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema, "users");
