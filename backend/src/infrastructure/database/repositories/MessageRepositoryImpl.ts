import mongoose from "mongoose";
import { Reaction } from "../../../application/useCases/chatService";
import { Message } from "../../../domain/entities/Message";
import { messageRepository } from "../../../domain/repositories/messageRepository";
import MessageModel from "../models/messageModel";

export class MessageRepositoryImpl implements messageRepository {
    async createMessage(chatId: string, senderId: string, senderModel: "user" | "worker", text: string , mediaUrl?:string): Promise<Message> {
      try {
        const message = new MessageModel({ chatId, senderId: senderId, senderModel, text , mediaUrl });
        return await message.save();
    } catch (error) {
        console.error("Error creating message:", error);
        throw new Error("Failed to create message."); 
    }
    }
  
    async getMessagesByChatId(chatId: string): Promise<Message[]> {
      return MessageModel.find({ chatId }).sort({ createdAt: 1 }).exec();
    }
    async addReaction (messageId:string , reaction: Reaction): Promise<Reaction> {
      const message = await MessageModel.findById(messageId);
      if (!message) {
          throw new Error("Message not found.");
      }
      if (!message.reactions) {
          message.reactions = [];
      }
      message.reactions.push(reaction);
      await message.save();
  
      return reaction;
}

async countUnreadMessages(chatIds: string[]) {
  const objectIds = chatIds.map(id => new mongoose.Types.ObjectId(id)); 
  return await MessageModel.aggregate([
      { 
          $match: { 
              isSeen: false,
              senderModel: "user",
              chatId: { $in: objectIds }  
          } 
      },
      { 
          $group: { 
              _id: "$chatId", 
              count: { $sum: 1 } 
          } 
      }
  ]);
}

async countUnreadMessagesforUser(chatIds: string[]) {
    const objectIds = chatIds.map(id => new mongoose.Types.ObjectId(id)); 
    return await MessageModel.aggregate([
        { 
            $match: { 
                isSeen: false,
                senderModel: "worker",
                chatId: { $in: objectIds }  
            } 
        },
        { 
            $group: { 
                _id: "$chatId", 
                count: { $sum: 1 } 
            } 
        }
    ]);
  }
  }