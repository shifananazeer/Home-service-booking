import { Types } from "mongoose";

export interface Message {
    sender:Types.ObjectId;
    senderRole: string;
    text:string;
    chatId:Types.ObjectId;
    createdAt?: Date;
  updatedAt?: Date;
}