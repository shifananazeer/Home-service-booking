import { Message } from "../../../domain/entities/Message";
import { messageRepository } from "../../../domain/repositories/messageRepository";
import MessageModel from "../models/messageModel";

export class MessageRepositoryImpl implements messageRepository {
    async createMessage(chatId: string, senderId: string, senderModel: "user" | "worker", text: string): Promise<Message> {
      try {
        const message = new MessageModel({ chatId, sender: senderId, senderModel, text });
        return await message.save(); // Ensure save is awaited
    } catch (error) {
        console.error("Error creating message:", error);
        throw new Error("Failed to create message."); // Throw an error to be caught in the controller
    }
    }
  
    async getMessagesByChatId(chatId: string): Promise<Message[]> {
      return MessageModel.find({ chatId }).sort({ createdAt: 1 }).exec();
    }
  }