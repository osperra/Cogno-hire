import mongoose, { Schema, Document } from "mongoose";

export interface InterviewResultDoc extends Document {
    userId: mongoose.Types.ObjectId;
    jobTitle: string;
    company: string;
    overallScore: number;
    feedback: string;
    skills: { skill: string; score: number }[];
    strengths: { title: string; description: string }[];
    improvements: { title: string; description: string }[];
    transcript: { role: string; content: string; ts: number }[];
    createdAt: Date;
}

const InterviewResultSchema = new Schema<InterviewResultDoc>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        jobTitle: { type: String, required: true },
        company: { type: String, required: true },
        overallScore: { type: Number, required: true },
        feedback: { type: String, default: "" },
        skills: [
            {
                skill: { type: String, required: true },
                score: { type: Number, required: true },
            },
        ],
        strengths: [
            {
                title: { type: String },
                description: { type: String },
            },
        ],
        improvements: [
            {
                title: { type: String },
                description: { type: String },
            },
        ],
        transcript: [
            {
                role: { type: String, required: true },
                content: { type: String, required: true },
                ts: { type: Number, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

export const InterviewResult =
    mongoose.models.InterviewResult ||
    mongoose.model<InterviewResultDoc>("InterviewResult", InterviewResultSchema, "interview_results");
