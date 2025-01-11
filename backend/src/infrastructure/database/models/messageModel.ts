import { model, Schema } from "mongoose";
import { Message } from "../../../domain/entities/Message";

export interface MessageDocument extends Message{}

const messageSchema = new Schema <MessageDocument> ({
    senderId: { type: Schema.Types.ObjectId, required: true }, 
    senderModel: { type: String, enum: ["user", "worker"], required: true },
    text: { type: String },
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    mediaUrl:{type:String}
  },
  { timestamps: true }   
)

export const MessageModel = model<MessageDocument>('Message' , messageSchema);
export default MessageModel;