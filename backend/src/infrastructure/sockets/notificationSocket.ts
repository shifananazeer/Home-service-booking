import { Server, Socket } from "socket.io";

export const createSocketConnectionForNotification = (io: Server, socket: Socket) => {
    
    socket.on('notification-join-room', (roomId: string) => {
        console.log('User joined notification room:', roomId);
        socket.join(roomId); 
    });

  
    socket.on('notification-leave-room', (roomId: string) => {
        console.log('User left notification room:', roomId);
        socket.leave(roomId); 
    });

 
    socket.on('send-notification', (data: { roomId: string; message: string ,bookingId:string }) => {
        const { roomId, message ,bookingId } = data;
        io.to(roomId).emit('receive-notification', {
            message,
            timestamp: new Date().toISOString(),
            bookingId
        });
        console.log(`Notification sent to room ${roomId}: ${message}`);
    });

 
    socket.on('disconnect', () => {
        console.log('User disconnected from notification service');
    });
};
