import { Message } from "../entities/Message";

export interface messageRepository {
    createMessage(chatId: string, senderId: string, senderModel: "User" | "Worker", text: string): Promise<Message>;
    getMessagesByChatId(chatId: string): Promise<Message[]>;
  }