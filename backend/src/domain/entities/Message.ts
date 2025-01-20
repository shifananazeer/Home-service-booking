import { Types } from "mongoose";

export interface Message {
    senderId:Types.ObjectId;
    senderModel: string;
    text:string;
    chatId:Types.ObjectId;
    reactions?: Reaction[];
    isSeen:boolean;
    seenBy:string;
    mediaUrl?: string; 
    createdAt?: Date;
  updatedAt?: Date;
}

export interface Reaction {
  userModel: "user" | "worker";
  emoji: string; 
}