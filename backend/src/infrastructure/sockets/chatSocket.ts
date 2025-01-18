import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import MessageModel from '../database/models/messageModel';
import UserModel from '../database/models/userModels';
import WorkerModel from '../database/models/workerModel';
import { createSocketConnectionForVideo } from './videoCallSocket';
import { createSocketConnectionForAudio } from './audioCallSocket';

// Extend the Socket interface to include userId
declare module 'socket.io' {
  interface Socket {
    userId?: string; // Add userId property
  }
}

// Declare types for events
interface Message {
  chatId: string;
  content: string;
  senderId: string;
}

interface MarkAsSeenPayload {
  messageIds: string[];
}

// Event names as enums for consistency
enum SocketEvents {
  CONNECT = 'connection',
  DISCONNECT = 'disconnect',
  JOIN = 'join',
  JOIN_CHAT = 'joinChat',
  SEND_MESSAGE = 'sendMessage',
  MARK_AS_SEEN = 'markAsSeen',
  NEW_MESSAGE = 'newMessage',
  MESSAGE_SEEN = 'messageSeen',
  SEEN_STATUS_UPDATED = 'seenStatusUpdated',
  ADD_REACTION = 'addReaction',
  REACTION_UPDATED = 'reactionUpdated', 
}

// Global variables
let io: Server; 
const onlineUsers: Record<string, boolean> = {}; 

export const setupSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on(SocketEvents.CONNECT, (socket) => {
    console.log('[Socket.IO] A user connected.');
    createSocketConnectionForVideo(io, socket);
    createSocketConnectionForAudio(io, socket);
    socket.on(SocketEvents.JOIN, async(userId: string) => {
      onlineUsers[userId] = true;
  io.emit('userOnline', { userId, isOnline: true }); 
  console.log("added online" ,userId)
  console.log("Current online users:", Object.keys(onlineUsers));
    
    });

   
    socket.on(SocketEvents.JOIN_CHAT, ({ chatId }) => {
      socket.join(chatId);
      console.log(`[Socket.IO] User joined chat: ${chatId} `);
      
    });

    socket.on('leaveChat', ({ chatId }) => {
      console.log(`Socket ${socket.id} left chat: ${chatId}`);
      socket.leave(chatId);
    });
  

    
    socket.on(SocketEvents.SEND_MESSAGE, (message: Message) => {
      console.log(`[Socket.IO] New message sent to chat ${message.chatId}`);
      io.to(message.chatId).emit(SocketEvents.NEW_MESSAGE, message);
    });

   
    socket.on(SocketEvents.MARK_AS_SEEN, async (payload: any) => {
      try {
        const { unseenMessageIds, chatId } = payload;
        const results = await MessageModel.updateMany(
          { _id: { $in: unseenMessageIds }, chatId: chatId },
          { isSeen: true }
        );
        if (results.modifiedCount > 0) {
          io.to(chatId).emit(SocketEvents.SEEN_STATUS_UPDATED, unseenMessageIds);
          console.log(`[Socket.IO] Updated seen status for messages in chat: ${chatId}`);
        }
      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    });

   
    socket.on(SocketEvents.ADD_REACTION, async (payload: { messageId: string; emoji: string }) => {
      const { messageId, emoji } = payload;
      const reactionData = { emoji, userModel: socket.userId }; // Use the connected user ID

      try {
        await MessageModel.findByIdAndUpdate(messageId, { $push: { reactions: reactionData } });
        const updatedMessage = await MessageModel.findById(messageId);
        if (!updatedMessage) {
          console.error('Message not found for ID:', messageId);
          return; 
        }
        const chatId = updatedMessage.chatId.toString(); 

        io.to(chatId).emit(SocketEvents.REACTION_UPDATED, { messageId, emoji, reactionData });
        console.log(`[Socket.IO] Broadcasted reaction for message ${messageId}`);
      } catch (error) {
        console.error('Error broadcasting reaction:', error);
      }
    });

  
    socket.on(SocketEvents.DISCONNECT, async () => {
      const userId = socket.userId; 
      if (userId) {
        delete onlineUsers[userId];
        io.emit('userOffline', { userId, isOnline: false });
      }
    });
  });

  return io; 
};

// Export the io instance for use elsewhere
export const getIo = () => io;
