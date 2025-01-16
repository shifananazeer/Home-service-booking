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

      async updateReaction (messageId:string , emoji:string , userModel: 'user' | 'worker'){
      
        const reaction: Reaction = { userModel, emoji };
        return await this.messageRepository.addReaction(messageId, reaction);
       
      }

      async getUnreadMessage (workerId:string) {
        
        const chats = await this.chatRepository.chatByWorkerId(workerId);
        console.log("Chats for worker:", chats);
        const chatIds: string[] = chats.map(chat => chat._id.toString()); 
        console.log("Chat IDs:", chatIds);

        // Step 2: Count unread messages for the chat IDs
        const unreadMessageCounts = await this.messageRepository.countUnreadMessages(chatIds);
        console.log("Unread message counts:", unreadMessageCounts);

        return unreadMessageCounts; // Return the unread
      }
      async getChatForUser(userId:string) {
        console.log('Fetching chats for user:', userId); // Add log here for debugging
    const chats = await this.chatRepository.getChatByUserId(userId);
    return chats;
      }
      async getUnreadMessageUser (userId:string) {
        
        const chats = await this.chatRepository.chatByWorkerId(userId);
        console.log("Chats for user:", chats);
        const chatIds: string[] = chats.map(chat => chat._id.toString()); 
        console.log("Chat IDs:", chatIds);

        // Step 2: Count unread messages for the chat IDs
        const unreadMessageCounts = await this.messageRepository.countUnreadMessagesforUser(chatIds);
        console.log("Unread message counts:", unreadMessageCounts);

        return unreadMessageCounts; // Return the unread
      }
    
}