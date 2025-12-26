import { Schema, model, Types } from "mongoose";

export type JobStatus = "draft" | "open" | "closed";

export interface SalaryRange {
  start?: number;
  end?: number;
  currency?: string; // optional if you want
}

export interface InterviewSettings {
  maxCandidates?: number;
  interviewDuration?: number;
  difficultyLevel?: string; // "easy" | "medium" | "hard"
  language?: string;
}

export interface JobDoc {
  _id: Types.ObjectId;
  employerId: Types.ObjectId;

  title: string;
  about?: string;

  location?: string;  // "hybrid"
  workType?: string;  // "remote"

  jobType?: string; // "full-time"
  salaryRange?: SalaryRange; // ✅ FIX (object)

  isActive?: boolean;
  workExperience?: number;

  interviewSettings?: InterviewSettings;

  invitedCandidates?: unknown[];

  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

const salaryRangeSchema = new Schema<SalaryRange>(
  {
    start: { type: Number },
    end: { type: Number },
    currency: { type: String, trim: true },
  },
  { _id: false }
);

const interviewSettingsSchema = new Schema<InterviewSettings>(
  {
    maxCandidates: { type: Number },
    interviewDuration: { type: Number },
    difficultyLevel: { type: String, trim: true },
    language: { type: String, trim: true },
  },
  { _id: false }
);

const jobSchema = new Schema<JobDoc>(
  {
    employerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, required: true, trim: true },
    about: { type: String },

    location: { type: String, trim: true },
    workType: { type: String, trim: true },

    jobType: { type: String, trim: true },

    // ✅ FIX: salaryRange as object
    salaryRange: { type: salaryRangeSchema },

    isActive: { type: Boolean, default: true },
    workExperience: { type: Number },

    interviewSettings: { type: interviewSettingsSchema },

    invitedCandidates: { type: [Schema.Types.Mixed], default: [] },

    status: { type: String, enum: ["draft", "open", "closed"], default: "open", index: true },
  },
  { timestamps: true }
);

export const Job = model<JobDoc>("Job", jobSchema, "jobs");
