import { Types } from "mongoose";

export interface Message {
    senderId:Types.ObjectId;
    senderModel: string;
    text:string;
    chatId:Types.ObjectId;
    reactions?: Reaction[];
    mediaUrl?: string; 
    createdAt?: Date;
  updatedAt?: Date;
}

export interface Reaction {
  userModel: "user" | "worker"; // Type of the user who reacted
  emoji: string; // Emoji used for the reaction
}