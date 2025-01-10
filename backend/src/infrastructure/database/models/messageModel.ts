import { model, Schema } from "mongoose";
import { Message } from "../../../domain/entities/Message";

export interface MessageDocument extends Message{}

const messageSchema = new Schema <MessageDocument> ({
    sender: { type: Schema.Types.ObjectId, required: true }, 
    senderModel: { type: String, enum: ["user", "worker"], required: true },
    text: { type: String, required: true },
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  },
  { timestamps: true }   
)

export const MessageModel = model<MessageDocument>('Message' , messageSchema);
export default MessageModel;