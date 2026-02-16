// Server/src/models/Document.ts
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

  gridFsId?: Types.ObjectId;
  bucketName?: string;

  fileUrl: string;

  cloudinaryPublicId?: string;
  cloudinaryResourceType?: "raw" | "image" | "video";
  cloudinaryDeliveryType?: string; 
  cloudinaryFormat?: string;
  cloudinaryVersion?: number;
  cloudinaryAccessMode?: string; 

  status: DocumentStatus;

  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<DocumentDoc>(
  {
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    uploadedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application" },

    name: { type: String, required: true },
    type: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },

    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },

    gridFsId: { type: Schema.Types.ObjectId, required: false, index: true },
    bucketName: { type: String, required: false, default: "docs" },

    fileUrl: { type: String, required: true },

    cloudinaryPublicId: { type: String, required: false },
    cloudinaryResourceType: {
      type: String,
      required: false,
      enum: ["raw", "image", "video"],
    },
    cloudinaryDeliveryType: { type: String, required: false },
    cloudinaryFormat: { type: String, required: false },
    cloudinaryVersion: { type: Number, required: false },
    cloudinaryAccessMode: { type: String, required: false },

    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "COMPLETED", "SIGNED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

documentSchema.index({ ownerUserId: 1, createdAt: -1 });
documentSchema.index({ jobId: 1, createdAt: -1 });
documentSchema.index({ applicationId: 1, createdAt: -1 });

const Document = model<DocumentDoc>("Document", documentSchema, "documents");
export default Document;

export { Document };
