import mongoose, { Schema } from "mongoose";

export type NotificationType =
  | "application_created"
  | "application_status_changed"
  | "job_created"
  | "general";

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    type: {
      type: String,
      enum: ["application_created", "application_status_changed", "job_created", "general"],
      default: "general",
      index: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    meta: { type: Schema.Types.Mixed }, // ✅
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", NotificationSchema);
