import { Chat } from "../entities/Chat";

export interface chatRepository {
    findChatByParticipants(userId: string, workerId: string): Promise<Chat | null>;
    createChat(userId: string, workerId: string): Promise<Chat>;
    getChatByWorkerId(workerId:string):Promise<Chat[]|[]>
  }