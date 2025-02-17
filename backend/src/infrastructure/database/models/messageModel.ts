import { model, Schema, Document } from "mongoose";
import { Message } from "../../../domain/entities/Message";

export interface MessageDocument extends Message, Document {}

const reactionSchema = new Schema({
 
  userModel: { type: String, enum: ["user", "worker"], required: true }, 
  emoji: { type: String, required: true }, 
}, { _id: false }); 

const messageSchema = new Schema<MessageDocument>({
  senderId: { type: Schema.Types.ObjectId, required: true, ref: "User" }, 
  senderModel: { type: String, enum: ["user", "worker"], required: true },
  text: { type: String },
  chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  mediaUrl: { type: String },
  reactions: [reactionSchema], 
  isSeen: { type: Boolean, default: false }, 
  seenBy: { type: String, default: null },
}, { timestamps: true });

export const MessageModel = model<MessageDocument>('Message', messageSchema);
export default MessageModel;
