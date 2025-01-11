import { Types } from "mongoose";

export interface Message {
    senderId:Types.ObjectId;
    senderModel: string;
    text:string;
    chatId:Types.ObjectId;
    mediaUrl?: string; 
    createdAt?: Date;
  updatedAt?: Date;
}