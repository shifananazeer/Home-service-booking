import { Notification } from "../entities/Notification";


export interface NotificationRepository {
    saveNotification(notificationData: Notification): Promise<void>;
    retriveNotificationNyuserId (userId:string) :Promise<Notification[]|[]>;
  }