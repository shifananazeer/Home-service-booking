import { Message } from "../entities/Message";

export interface messageRepository {
    createMessage(chatId: string, senderId: string, senderModel: "user" | "worker", text: string): Promise<Message>;
    getMessagesByChatId(chatId: string): Promise<Message[]>;
  }