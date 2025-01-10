import { Chat } from "../../../domain/entities/Chat";
import { chatRepository } from "../../../domain/repositories/chatRepository";
import ChatModel from "../models/chatModel";

export class ChatRepositoryImpl implements chatRepository {
    async findChatByParticipants(userId: string, workerId: string): Promise<Chat | null> {
      return ChatModel.findOne({
        participants: { $all: [{ participantId: userId }, { participantId: workerId }] },
      }).exec();
    }
  
    async createChat(userId: string, workerId: string): Promise<Chat> {
      const chat = new ChatModel({
        participants: [
          { participantId: userId, role: "user" },
          { participantId: workerId, role: "worker" },
        ],
      });
      return chat.save();
    }
  }