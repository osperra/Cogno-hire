import { Schema, model, Types } from "mongoose";

export interface JobMatchCacheDoc {
  _id: Types.ObjectId;
  candidateId: Types.ObjectId;
  resumeHash: string;
  jobId: string;
  jobHash: string;
  match: number;
  provider?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobMatchCacheSchema = new Schema<JobMatchCacheDoc>(
  {
    candidateId: { type: Schema.Types.ObjectId, required: true, index: true },
    resumeHash: { type: String, required: true, index: true },
    jobId: { type: String, required: true, index: true },
    jobHash: { type: String, required: true },
    match: { type: Number, required: true },
    provider: { type: String, required: false },
  },
  { timestamps: true }
);

jobMatchCacheSchema.index(
  { candidateId: 1, resumeHash: 1, jobId: 1, jobHash: 1 },
  { unique: true }
);

// Optional TTL cleanup (30 days)
// jobMatchCacheSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const JobMatchCache = model<JobMatchCacheDoc>(
  "JobMatchCache",
  jobMatchCacheSchema,
  "job_match_cache"
);

export default JobMatchCache;
export { JobMatchCache };
