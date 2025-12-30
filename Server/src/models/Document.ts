import { Schema, model, Types } from "mongoose";

export type DocumentStatus = "PENDING" | "VERIFIED" | "COMPLETED" | "SIGNED";

export interface DocumentDoc {
    _id: Types.ObjectId;

    ownerUserId: Types.ObjectId;
    uploadedByUserId: Types.ObjectId;

    jobId?: Types.ObjectId;
    applicationId?: Types.ObjectId;

    name: string;
    type: string;
    category: string;

    mimeType: string;
    sizeBytes: number;

    fileUrl: string;
    status: DocumentStatus;

    createdAt: Date;
    updatedAt: Date;
}

const docSchema = new Schema<DocumentDoc>(
    {
        ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        uploadedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        jobId: { type: Schema.Types.ObjectId, ref: "Job" },
        applicationId: { type: Schema.Types.ObjectId, ref: "Application" },

        name: { type: String, required: true },
        type: { type: String, required: true, index: true },
        category: { type: String, required: true, index: true },

        mimeType: { type: String, required: true },
        sizeBytes: { type: Number, required: true },

        fileUrl: { type: String, required: true },
        status: { type: String, enum: ["PENDING", "VERIFIED", "COMPLETED", "SIGNED"], default: "PENDING", index: true },
    },
    { timestamps: true }
);

docSchema.index({ ownerUserId: 1, createdAt: -1 });

export const Document =
    model<DocumentDoc>("Document", docSchema, "documents");
