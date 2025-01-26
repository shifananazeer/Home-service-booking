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
            from: 'users', 
            localField: 'participants.participantId',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        {
          $project: {
            _id: 1,
            participants: 1, 
            createdAt: 1,
            updatedAt: 1,
            userInfo: {
              $arrayElemAt: [
                '$userInfo',
                {
                  $cond: [
                    { $eq: ['$participants.role', 'user'] },
                    0, 
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


  async getChatByUserId(userId: string): Promise<Chat[] | []> {
    console.log('Fetching chats for user ID:', userId);
  
    const chats = await ChatModel.aggregate([
      {
        $match: {
          'participants.participantId': new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'workers', // Replace with your actual workers collection name
          localField: 'participants.participantId',
          foreignField: '_id',
          as: 'workerInfo',
        },
      },
      {
        $lookup: {
          from: 'messages', // Replace with your actual messages collection name
          let: { chatId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$chatId', '$$chatId'] },
              },
            },
            {
              $sort: { createdAt: -1 }, // Sort by createdAt to get the latest message first
            },
            {
              $limit: 1, // Limit to the latest message
            },
          ],
          as: 'lastMessage',
        },
      },
      {
        $project: {
          _id: 1,
          participants: 1,
          createdAt: 1,
          updatedAt: 1,
          userInfo: {
            $arrayElemAt: [
              '$workerInfo',
              {
                $cond: [
                  { $eq: ['$participants.role', 'worker'] },
                  0,
                  -1,
                ],
              },
            ],
          },
          lastMessage: { $arrayElemAt: ['$lastMessage', 0] }, // Extract the latest message from the array
        },
      },
    ]);
  
    console.log('Chats with worker info and last message:', chats);
    return chats;
  }
  
  async chatByWorkerId(workerId: string) {
    return await ChatModel.find({ 
        participants: { $elemMatch: { participantId: workerId } } 
    }).select('_id');
}
}