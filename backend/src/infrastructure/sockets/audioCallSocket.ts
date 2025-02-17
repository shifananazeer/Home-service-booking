import { Server, Socket } from "socket.io";
import { UserService } from "../../application/useCases/userService";

const userService = new UserService();
export const createSocketConnectionForAudio = (io: Server, socket: Socket) => {
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

    interface IncomingAudioCallPayload {
        receiverId: string;
    }

    interface CallAcceptedPayload {
        receiverId: string;
    }
    interface UserDetails {
        firstName?: string;
        lastName?: string;
    }
    socket.on("audio-join-room", (roomId: string) => {
        socket.join(roomId);
        console.log("1: User joined room:", roomId);
    });
    socket.on("audio-offer",async ({ roomId,caller,offer }: OfferPayload) => {
        console.log(caller)
        const userName = await userService.getName(caller);
        io.to(roomId).emit("offerNotification", { roomId,userName,caller,callType:'Audio'});
        socket.to(roomId).emit("audio-offer", offer);
        console.log("2: Offer sent to room:", roomId, offer);
    });

    socket.on("audio-answer", ({ roomId, answer }: AnswerPayload) => {
        socket.to(roomId).emit("audio-answer", answer);
        console.log("3: Answer sent to room:", roomId);
    });
    socket.on("audio-ice-candidate", ({ roomId, candidate }: IceCandidatePayload) => {
        socket.to(roomId).emit("audio-ice-candidate", candidate);
        console.log("4: ICE candidate sent to room:", roomId);
    });
    socket.on("leave-room", (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit("call-disconnected", { roomId, userId: socket.id });
        console.log(`User ${socket.id} left room ${roomId}`);
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
    });socket.on("leave-room-decline", (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit("call-decline", { roomId, userId: socket.id });
        console.log(`User ${socket.id} left room ${roomId}`);
    });
}