import mongoose, { Schema } from "mongoose";
import { Notification } from "../../../domain/entities/Notification";

export interface NotificationDocument extends Notification{}
const NotificationSchema = new Schema <NotificationDocument>({
    userId: { type: String, required: true},
  userType: {
    type: String,
    required: true,
    enum: ["user", "worker"], // Allows dynamic referencing for User or Worker
  },
  bookingId:{ type: String, required: true},
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

export const NotificationModel = mongoose.model<NotificationDocument> ('Notification',NotificationSchema);
export default NotificationModel;
