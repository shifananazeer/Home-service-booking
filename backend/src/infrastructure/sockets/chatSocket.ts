import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server; // Declare the io variable at the top

export const setupSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on('sendMessage', (message) => {
      io.to(message.chatId).emit('newMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  return io; // Return the io instance if needed for further use
};

// Export the io instance
export const getIo = () => io; // Function to access io instance
