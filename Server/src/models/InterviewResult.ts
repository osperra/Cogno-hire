import mongoose, { Schema, Document, Types } from "mongoose";

export type InterviewRole = "ai" | "candidate";
export type InterviewStatus = "completed" | "incomplete";

export type InterviewTranscriptItem = {
  role: InterviewRole;
  content: string;
  ts: number;
};

export interface InterviewResultDoc extends Document {
  userId: Types.ObjectId;

  applicationId?: Types.ObjectId;
  jobId?: Types.ObjectId;

  jobTitle: string;
  company: string;

  // ✅ NEW (prevents fake scores)
  status: InterviewStatus;
  answeredCount: number;
  meaningfulAnsweredCount: number;

  overallScore: number;
  feedback: string;

  skills: { skill: string; score: number }[];
  strengths: { title: string; description: string }[];
  improvements: { title: string; description: string }[];

  transcript: InterviewTranscriptItem[];

  createdAt: Date;
  updatedAt: Date;
}

const InterviewResultSchema = new Schema<InterviewResultDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    applicationId: { type: Schema.Types.ObjectId, ref: "Application", index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", index: true },

    jobTitle: { type: String, required: true },
    company: { type: String, required: true },

    // ✅ NEW
    status: { type: String, enum: ["completed", "incomplete"], default: "completed", index: true },
    answeredCount: { type: Number, default: 0 },
    meaningfulAnsweredCount: { type: Number, default: 0 },

    overallScore: { type: Number, required: true },
    feedback: { type: String, default: "" },

    skills: [
      {
        skill: { type: String, required: true },
        score: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    strengths: [
      {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],
    improvements: [
      {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],
    transcript: [
      {
        role: { type: String, enum: ["ai", "candidate"], required: true },
        content: { type: String, required: true, default: "" },
        ts: { type: Number, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

InterviewResultSchema.index({ applicationId: 1, createdAt: -1 });
InterviewResultSchema.index({ userId: 1, createdAt: -1 });

export const InterviewResult =
  mongoose.models.InterviewResult ||
  mongoose.model<InterviewResultDoc>("InterviewResult", InterviewResultSchema, "interview_results");
