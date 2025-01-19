import { Server, Socket } from "socket.io";

export const createSocketConnectionForNotification = (io: Server, socket: Socket) => {
    // Handle joining the notification room
    socket.on('notification-join-room', (roomId: string) => {
        console.log('User joined notification room:', roomId);
        socket.join(roomId); // Join the specified room
    });

    // Handle leaving the notification room
    socket.on('notification-leave-room', (roomId: string) => {
        console.log('User left notification room:', roomId);
        socket.leave(roomId); // Leave the specified room
    });

    // Emit a notification to a specific room
    socket.on('send-notification', (data: { roomId: string; message: string ,bookingId:string }) => {
        const { roomId, message ,bookingId } = data;
        io.to(roomId).emit('receive-notification', {
            message,
            timestamp: new Date().toISOString(),
            bookingId
        });
        console.log(`Notification sent to room ${roomId}: ${message}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected from notification service');
    });
};
