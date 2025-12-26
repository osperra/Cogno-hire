// server/models/Application.ts
import { Schema, model, Types } from "mongoose";

export type InterviewStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type HiringStatus =
  | "PENDING"
  | "INVITED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "HIRED"
  | "REJECTED";

export interface ApplicationDoc {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;

  interviewStatus: InterviewStatus;
  hiringStatus: HiringStatus;

  overallScore?: number;
  communication?: string;

  coverLetter?: string;
  resumeUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<ApplicationDoc>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    interviewStatus: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
      default: "PENDING",
      index: true,
    },
    hiringStatus: {
      type: String,
      enum: ["PENDING", "INVITED", "UNDER_REVIEW", "SHORTLISTED", "HIRED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    overallScore: { type: Number, default: 0 },
    communication: { type: String, default: "AVERAGE" },

    coverLetter: { type: String },
    resumeUrl: { type: String },
  },
  { timestamps: true }
);

// prevent duplicate apply (same job + same candidate)
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export const Application = model<ApplicationDoc>("Application", applicationSchema, "applications");
