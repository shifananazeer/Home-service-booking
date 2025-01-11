import { Types } from "mongoose";
import WorkerModel from "../../infrastructure/database/models/workerModel";
import { ChatRepositoryImpl } from "../../infrastructure/database/repositories/ChatRepositoryImpl";
import { MessageRepositoryImpl } from "../../infrastructure/database/repositories/MessageRepositoryImpl";

export interface Reaction {
  userModel:'user'|'worker';
  emoji: string;
}

export class ChatService {
    private chatRepository : ChatRepositoryImpl;
    private messageRepository: MessageRepositoryImpl;

    constructor() {
        this.chatRepository = new ChatRepositoryImpl();
        this.messageRepository = new MessageRepositoryImpl();
      }


      async createOrFetchChat(userId: string, workerId: string) {
        let chat = await this.chatRepository.findChatByParticipants(userId, workerId);
        console.log("chat", chat)
    
        if (!chat) {
          chat = await this.chatRepository.createChat(userId, workerId);
        }
    
        return chat;
      }
    
      async sendMessage(chatId: string, senderId: string, senderModel: "user" | "worker", text: string ,mediaUrl?: string) {
        
        const message = await this.messageRepository.createMessage(chatId, senderId, senderModel, text , mediaUrl);
        return message;
      }
    
      async getMessages(chatId: string) {
        const messages = await this.messageRepository.getMessagesByChatId(chatId);
        return messages;
      }

      async getChatForWorker(workerId:string) {
        console.log('Fetching chats for worker:', workerId); // Add log here for debugging
    const chats = await this.chatRepository.getChatByWorkerId(workerId);
    return chats;
      }

      async updateReaction (messageId:string , emoji:string , userModel: 'worker'){
      
        const reaction: Reaction = { userModel, emoji };
        return await this.messageRepository.addReaction(messageId, reaction);
       
      }
    
}