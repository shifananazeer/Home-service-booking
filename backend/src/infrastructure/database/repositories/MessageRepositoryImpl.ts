import { Message } from "../../../domain/entities/Message";
import { messageRepository } from "../../../domain/repositories/messageRepository";
import MessageModel from "../models/messageModel";

export class MessageRepositoryImpl implements messageRepository {
    async createMessage(chatId: string, senderId: string, senderModel: "User" | "Worker", text: string): Promise<Message> {
      const message = new MessageModel({ chatId, sender: senderId, senderModel, text });
      return message.save();
    }
  
    async getMessagesByChatId(chatId: string): Promise<Message[]> {
      return MessageModel.find({ chatId }).sort({ createdAt: 1 }).exec();
    }
  }