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

    savedJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],

    savedSearches: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

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
      careerGoals: {
        targetRole: { type: String, trim: true },
        targetSalary: {
          min: { type: Number },
          max: { type: Number },
          currency: { type: String, default: "USD" },
        },
        targetIndustries: [{ type: String, trim: true }],
        timeline: {
          type: String,
          enum: ["Immediate", "1-3 Months", "3-6 Months", "6-12 Months", "Open"],
        },
        skillsToAcquire: [{ type: String, trim: true }],
        notes: { type: String, trim: true },
      },
    },
  },
  { timestamps: true }
);

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "candidate" | "employer" | "hr";
  phone?: string;
  location?: string;
  headline?: string;
  about?: string;
  experienceLevel?: "Fresher" | "Junior" | "Mid" | "Senior" | "Lead";
  skills?: string[];
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resumeUrl?: string;
  resumeDocId?: mongoose.Types.ObjectId;
  resumeFileName?: string;
  resumePublicId?: string;
  resumeFormat?: string;
  resumeResourceType?: "raw" | "image" | "video";
  savedJobs?: mongoose.Types.ObjectId[];
  savedSearches?: {
    _id?: mongoose.Types.ObjectId;
    title: string;
    url: string;
    createdAt?: Date;
  }[];
  preferences?: {
    jobTypes?: string[];
    workModes?: string[];
    locations?: string[];
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    relocation?: boolean;
    settings?: {
      emailNotifications?: boolean;
      productUpdates?: boolean;
      marketingEmails?: boolean;
      desktopNotifications?: boolean;
      weeklySummary?: boolean;
      defaultLanding?: string;
      theme?: string;
    };
    careerGoals?: {
      targetRole?: string;
      targetSalary?: {
        min?: number;
        max?: number;
        currency?: string;
      };
      targetIndustries?: string[];
      timeline?: "Immediate" | "1-3 Months" | "3-6 Months" | "6-12 Months" | "Open";
      skillsToAcquire?: string[];
      notes?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema, "users");
