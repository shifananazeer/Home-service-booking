import { ChatRepositoryImpl } from "../../infrastructure/database/repositories/ChatRepositoryImpl";
import { MessageRepositoryImpl } from "../../infrastructure/database/repositories/MessageRepositoryImpl";



export class ChatService {
    private chatRepository : ChatRepositoryImpl;
    private messageRepository: MessageRepositoryImpl;

    constructor() {
        this.chatRepository = new ChatRepositoryImpl();
        this.messageRepository = new MessageRepositoryImpl();
      }


      async createOrFetchChat(userId: string, workerId: string) {
        let chat = await this.chatRepository.findChatByParticipants(userId, workerId);
    
        if (!chat) {
          chat = await this.chatRepository.createChat(userId, workerId);
        }
    
        return chat;
      }
    
      async sendMessage(chatId: string, senderId: string, senderModel: "User" | "Worker", text: string) {
        const message = await this.messageRepository.createMessage(chatId, senderId, senderModel, text);
        return message;
      }
    
      async getMessages(chatId: string) {
        const messages = await this.messageRepository.getMessagesByChatId(chatId);
        return messages;
      }
    
}