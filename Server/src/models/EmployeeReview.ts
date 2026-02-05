import mongoose, { Schema, Document } from "mongoose";

export type ReviewStatus = "COMPLETED" | "PENDING" | "SCHEDULED";

export interface IEmployeeReview extends Document {
    employeeId: mongoose.Types.ObjectId;
    employeeName: string;
    position: string;

    reviewerId: mongoose.Types.ObjectId;
    reviewerName: string;

    reviewDate: Date;

    overallRating: number;
    categories: {
        technical: number;
        communication: number;
        teamwork: number;
        productivity: number;
    };

    status: ReviewStatus;

    managerFeedback?: string;
    areasForGrowth?: string;
    goals?: string[];

    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema(
    {
        technical: { type: Number, default: 0, min: 0, max: 5 },
        communication: { type: Number, default: 0, min: 0, max: 5 },
        teamwork: { type: Number, default: 0, min: 0, max: 5 },
        productivity: { type: Number, default: 0, min: 0, max: 5 },
    },
    { _id: false }
);

const EmployeeReviewSchema = new Schema<IEmployeeReview>(
    {
        employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        employeeName: { type: String, required: true },
        position: { type: String, required: true },

        reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        reviewerName: { type: String, required: true },

        reviewDate: { type: Date, required: true },

        overallRating: { type: Number, default: 0, min: 0, max: 5 },
        categories: { type: CategorySchema, required: true },

        status: {
            type: String,
            enum: ["COMPLETED", "PENDING", "SCHEDULED"],
            default: "PENDING",
        },

        managerFeedback: String,
        areasForGrowth: String,
        goals: [String],
    },
    { timestamps: true }
);

export const EmployeeReview = mongoose.model<IEmployeeReview>(
    "EmployeeReview",
    EmployeeReviewSchema
);
