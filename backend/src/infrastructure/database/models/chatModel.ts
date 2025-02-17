import { model, Schema } from "mongoose";
import { Chat } from "../../../domain/entities/Chat";


export interface ChatDocument extends Chat {}

const chatSchema = new Schema <ChatDocument>({
    participants: [
        {
          participantId: { type: Schema.Types.ObjectId, required: true }, 
          role: { type: String, enum: ["user", "worker"], required: true }, 
        },
      ],
      createdAt: { type: Date, default: Date.now }, 
    },
    { timestamps: true } 
  );
  export const ChatModel = model<ChatDocument>("Chat", chatSchema);
  export default ChatModel