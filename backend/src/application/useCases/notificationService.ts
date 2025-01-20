import { NotificationRepository } from "../../domain/repositories/notificationRepository";
import { Notification } from "../../domain/entities/Notification";
import { NotificationRepositoryImpl } from "../../infrastructure/database/repositories/NotificationRepositoryIml";
export class NotificationService {
    private notificationRepository: NotificationRepositoryImpl;

    constructor() {
      this.notificationRepository = new NotificationRepositoryImpl();
    }
  
    async saveNotification(notificationData: Notification): Promise<void> {
      await this.notificationRepository.saveNotification(notificationData);
    }
    async fetchNotifications (userId:string) :Promise<Notification[]|[]> {
     const result = await this.notificationRepository.retriveNotificationNyuserId(userId)
     return result;
    }
}