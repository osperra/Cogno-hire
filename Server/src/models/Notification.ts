// server/models/Notification.ts
import { Schema, model, Types } from "mongoose";

export type NotificationType =
  | "application_created"
  | "application_status_changed"
  | "job_created"
  | "general";

export interface NotificationDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  meta?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["application_created", "application_status_changed", "job_created", "general"],
      default: "general",
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    link: { type: String },
    meta: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Notification = model<NotificationDoc>(
  "Notification",
  notificationSchema,
  "notifications"
);
