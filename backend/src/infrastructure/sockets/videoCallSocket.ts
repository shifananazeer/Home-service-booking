import { Server, Socket } from "socket.io";
import { UserRepositoryImpl } from "../database/repositories/UserRepositoryImpl";
import { UserService } from "../../application/useCases/userService";

const userService = new UserService();

export const createSocketConnectionForVideo = (io: Server, socket: Socket) => {
    interface IceCandidatePayload {
        roomId: string;
        candidate: RTCIceCandidate;
    }
 
    interface OfferPayload {
        roomId: string;
        caller:string;
        offer: RTCSessionDescriptionInit;
    }

    interface AnswerPayload {
        roomId: string;
        answer: RTCSessionDescriptionInit;
    }

    interface IncomingVideoCallPayload {
        receiverId: string;
    }

    interface CallAcceptedPayload {
        receiverId: string;
    }
    interface UserDetails {
        firstName?: string;
        lastName?: string;
    }
    socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        console.log("1: User joined room:", roomId);
    });
    socket.on("offer",async ({ roomId,caller,offer }: OfferPayload) => {
        console.log(caller)
        console.log("roomId" , roomId)
        const userName=await userService.getName(caller)
        
         io.to(roomId).emit("offerNotification", { roomId, userName, caller, callType: 'Video' });
          socket.to(roomId).emit("offer", offer);
          console.log("2: Offer sent to room:", roomId, offer);
    });

    socket.on("answer", ({ roomId, answer }: AnswerPayload) => {
        socket.to(roomId).emit("answer", answer);
        console.log("3: Answer sent to room:", roomId);
    });
    socket.on("ice-candidate", ({ roomId, candidate }: IceCandidatePayload) => {
        socket.to(roomId).emit("ice-candidate", candidate);
        console.log("4: ICE candidate sent to room:", roomId);
    });
    socket.on("leave-room-decline", (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit("call-decline", { roomId, userId: socket.id });
        console.log(`User ${socket.id} left room ${roomId}`);
    });
    socket.on("leave-room", (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit("call-disconnected", { roomId, userId: socket.id });
        console.log(`User ${socket.id} left room ${roomId}`);
    });
}