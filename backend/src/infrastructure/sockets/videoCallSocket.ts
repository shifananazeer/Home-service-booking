import { Server, Socket } from "socket.io";
import { UserService } from "../../application/useCases/userService";

const userService = new UserService();

export const createSocketConnectionForVideo = (io: Server, socket: Socket) => {
    interface IceCandidatePayload {
        roomId: string;
        candidate: RTCIceCandidate;
    }
 
    interface OfferPayload {
        roomId: string;
        caller: string;
        offer: RTCSessionDescriptionInit;
    }

    interface AnswerPayload {
        roomId: string;
        answer: RTCSessionDescriptionInit;
    }

    socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        console.log("User joined room:", roomId);
    });

    socket.on("offer", async ({ roomId, caller, offer }: OfferPayload) => {
        console.log("Offer received from:", caller);
        console.log("Room ID:", roomId);
        try {
            const userName = await userService.getName(caller);
            io.to(roomId).emit("offerNotification", { roomId, userName, caller, callType: 'Video', offer });
            socket.to(roomId).emit("offer", offer);
            console.log("Offer notification sent to room:", roomId);
        } catch (error) {
            console.error("Error processing offer:", error);
        }
    });

    socket.on("answer", ({ roomId, answer }: AnswerPayload) => {
        socket.to(roomId).emit("answer", answer);
        console.log("Answer sent to room:", roomId);
    });

    socket.on("ice-candidate", ({ roomId, candidate }: IceCandidatePayload) => {
        socket.to(roomId).emit("ice-candidate", candidate);
        console.log("ICE candidate sent to room:", roomId);
    });

    socket.on("leave-room-decline", (roomId: string) => {
        socket.leave(roomId);
        socket.to(roomId).emit("call-decline", { roomId, userId: socket.id });
        console.log(`User ${socket.id} declined call and left room ${roomId}`);
    });

    socket.on("leave-room", (roomId: string) => {
        socket.leave(roomId);
        socket.to(roomId).emit("call-disconnected", { roomId, userId: socket.id });
        console.log(`User ${socket.id} left room ${roomId}`);
    });
}

