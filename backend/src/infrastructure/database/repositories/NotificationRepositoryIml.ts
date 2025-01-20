import { NotificationRepository } from "../../../domain/repositories/notificationRepository";
import { Notification } from "../../../domain/entities/Notification";
import NotificationModel from "../models/notificationModel";

export class NotificationRepositoryImpl implements NotificationRepository {
  async saveNotification(notificationData: Notification): Promise<void> {
    const { userId, userType, message , bookingId } = notificationData;

    try {
      await NotificationModel.create({
        userId,
        userType,
        message,
        bookingId,
        isRead: false,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving notification to database:", error);
      throw new Error("Database error while saving notification.");
    }
  }
}
