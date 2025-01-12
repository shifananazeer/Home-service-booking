import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import MessageModel from '../database/models/messageModel';

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
  ADD_REACTION = 'addReaction', // New event for adding reactions
  REACTION_UPDATED = 'reactionUpdated', // New event for updating reaction
}

// Global variables
let io: Server; // Declare the io variable
const onlineUsers = new Set<string>(); // Track online users

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

    // Handle user joining
    socket.on(SocketEvents.JOIN, (userId: string) => {
      onlineUsers.add(userId);
      socket.userId = userId;
      console.log(`[Socket.IO] User ${userId} is online.`);
    });

    // Handle user joining a chat
    socket.on(SocketEvents.JOIN_CHAT, (chatId: string) => {
      socket.join(chatId);
      console.log(`[Socket.IO] User joined chat: ${chatId}`);
    });

    // Handle message sending
    socket.on(SocketEvents.SEND_MESSAGE, (message: Message) => {
      console.log(`[Socket.IO] New message sent to chat ${message.chatId}`);
      io.to(message.chatId).emit(SocketEvents.NEW_MESSAGE, message);
    });

    // Handle marking messages as seen
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
        // Handle the error appropriately
      }
    })


    
    

    // Handle disconnection
    socket.on(SocketEvents.DISCONNECT, () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log(`[Socket.IO] User ${socket.userId} disconnected.`);
      } else {
        console.log('[Socket.IO] A user disconnected without a user ID.');
      }
    });
  });

  return io; // Return the io instance
};

// Export the io instance for use elsewhere
export const getIo = () => io;
