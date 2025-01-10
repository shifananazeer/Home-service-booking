import { Types } from "mongoose";

export interface Participant {
    participantId: Types.ObjectId; 
    role: "user" | "worker"; 
  }

export interface Chat {
    participants: Types.ObjectId[]; 
    createdAt?: Date;
    updatedAt?: Date;
}