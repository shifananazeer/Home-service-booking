import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export const setupSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on('sendMessage', (message) => {
      // Here, you would save the message to the database
      // Then emit the message to other users in the chat
      io.to(message.chatId).emit('newMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  return io; // Return the io instance if needed for further use
};
