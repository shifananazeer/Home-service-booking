import { Types } from "mongoose";

export interface Message {
    sender:Types.ObjectId;
    senderModel: string;
    text:string;
    chatId:Types.ObjectId;
    createdAt?: Date;
  updatedAt?: Date;
}