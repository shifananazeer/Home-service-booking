import mongoose from "mongoose";
import { Chat } from "../../../domain/entities/Chat";
import { chatRepository } from "../../../domain/repositories/chatRepository";
import ChatModel from "../models/chatModel";
import UserModel from "../models/userModels";

export class ChatRepositoryImpl implements chatRepository {
    async findChatByParticipants(userId: string, workerId: string): Promise<Chat | null> {
      return ChatModel.findOne({
        participants: {
          $all: [
            { $elemMatch: { participantId: new mongoose.Types.ObjectId(userId), role: "user" } },
            { $elemMatch: { participantId: new mongoose.Types.ObjectId(workerId), role: "worker" } },
          ],
        },
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

    async getChatByWorkerId(workerId:string) :Promise <Chat[]|[]> {
      console.log('Fetching chats for worker ID:', workerId); 
      const chats = await ChatModel.aggregate([
        {
          $match: {
            'participants.participantId': new mongoose.Types.ObjectId(workerId),
          },
        },
        {
          $lookup: {
            from: 'users', // Assuming your user collection is named 'users'
            localField: 'participants.participantId',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        {
          $project: {
            _id: 1,
            participants: 1, // Retain the entire participants array
            createdAt: 1,
            updatedAt: 1,
            userInfo: {
              $arrayElemAt: [
                '$userInfo',
                {
                  $cond: [
                    { $eq: ['$participants.role', 'user'] },
                    0, // Pick the user participant info
                    -1,
                  ],
                },
              ],
            },
          },
        },
      ]);
    
      console.log('Chats with user info:', chats);
      return chats;
  }
}