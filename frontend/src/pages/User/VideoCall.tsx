import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import socket from "../../utils/socket";

const VideoCallPage = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const [callStarted, setCallStarted] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(false); // Default to false
  const [callStatus, setCallStatus] = useState("Connecting..."); // Add call status
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const roomId = workerId || ""; // Ensure roomId is always a string
  const userId = localStorage.getItem('user_Id');

  const servers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    socket.emit("join-room", roomId);

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
      try {
        if (!peerConnection.current) return;

        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.emit("answer", { roomId, answer });
        setCallStatus("Connected.");
        setIsConnected(true); // Set connected state to true
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
      try {
        if (!peerConnection.current) return;
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus("Connected.");
        setIsConnected(true); // Set connected state to true
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    };

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
      try {
        if (!peerConnection.current) return;
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    };

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.emit("leave-room", roomId);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, [roomId]);

  useEffect(() => {
    const handleDisconnect = ({ roomId: disconnectedRoomId }: { roomId: string }) => {
      if (disconnectedRoomId === roomId) {
        setIsConnected(false);
        navigate(`/message`, {
          state: { videoCallConnection: true },
        });
      }
    };

    const handleDecline = ({ roomId: declinedRoomId }: { roomId: string }) => {
      if (declinedRoomId === roomId) {
        setIsConnected(false);
        navigate(`/messages`, {
          state: { videoCallDecline: true },
        });
      }
    };

    socket.on("call-disconnected", handleDisconnect);
    socket.on("call-decline", handleDecline);

    return () => {
      socket.off("call-disconnected", handleDisconnect);
      socket.off("call-decline", handleDecline);
    };
  }, [roomId, navigate]);

  const startCall = async () => {
    try {
      setCallStarted(true);
      setCallStatus("Connecting...");
      peerConnection.current = new RTCPeerConnection(servers);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { roomId, candidate: event.candidate });
        }
      };

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("offer", { roomId, caller: workerId, offer });
      console.log("Offer emitted");
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;
    setCallStarted(false);
    setIsConnected(false);
    setCallStatus("Call ended."); // Update status when call ends
  };

 

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Video Call</h1>
      <div className="flex space-x-4">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-1/2 h-auto bg-black rounded-lg"
        ></video>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-1/2 h-auto bg-black rounded-lg"
        ></video>
      </div>
      <div className="mt-6">
        <p>{callStatus}</p> {/* Display call status */}
        {!callStarted ? (
          <button
            onClick={startCall}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Start Call
          </button>
        ) : (
          <button
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCallPage;
