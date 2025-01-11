import { model, Schema, Document } from "mongoose";
import { Message } from "../../../domain/entities/Message";

export interface MessageDocument extends Message, Document {}

const reactionSchema = new Schema({
 
  userModel: { type: String, enum: ["user", "worker"], required: true }, // Indicate if User or Worker
  emoji: { type: String, required: true }, // Emoji used for the reaction
}, { _id: false }); // Disable automatic _id for subdocuments

const messageSchema = new Schema<MessageDocument>({
  senderId: { type: Schema.Types.ObjectId, required: true, ref: "User" }, // Adjust if necessary
  senderModel: { type: String, enum: ["user", "worker"], required: true },
  text: { type: String },
  chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  mediaUrl: { type: String },
  reactions: [reactionSchema], // Include reactions as an array of Reaction schema
}, { timestamps: true });

export const MessageModel = model<MessageDocument>('Message', messageSchema);
export default MessageModel;
