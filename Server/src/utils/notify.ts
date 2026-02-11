import { Types } from "mongoose";
import { Notification, type NotificationType } from "../models/Notification.js";

export async function notifyUser(params: {
  userId: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  meta?: Record<string, unknown>;
}) {
  const userId =
    typeof params.userId === "string" ? new Types.ObjectId(params.userId) : params.userId;

  return Notification.create({
    userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
    meta: params.meta,
    isRead: false,
  });
}
