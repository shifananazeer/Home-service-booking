import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import socket from "../../utils/socket";

const VideoCallPage = () => {
 
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState("Connecting...");

  const roomId = localStorage.getItem("workerId")!; // Get room ID from localStorage or props

  useEffect(() => {
    console.log("Joining room with ID:", roomId);

    socket.emit("join-room", roomId);

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:your-turn-server-url",
          username: "username",
          credential: "password",
        },
      ],
    });
    peerConnection.current = pc;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        setCallStatus("Waiting for connection...");
      })
      .catch((error) => {
        console.error("Error accessing media:", error);
        setCallStatus("Failed to access media.");
      });

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
        setCallStatus("Connected.");
      } catch (error) {
        console.error("Error handling offer:", error);
        setCallStatus("Connection failed.");
      }
    });

    socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus("Connected.");
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
        console.log("Received ICE candidate:", candidate); // Log received ICE candidates
        if (candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("ICE candidate added successfully.");
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        }
      });
    socket.on("call-disconnected", () => {
      setCallStatus("Call ended.");
      if (peerConnection.current) peerConnection.current.close();
    });

    return () => {
      pc.close();
      socket.emit("leave-room", roomId);
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [roomId]);

  const toggleAudio = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream.getAudioTracks().forEach((track) => (track.enabled = !isMuted));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream.getVideoTracks().forEach((track) => (track.enabled = !isVideoOff));
    setIsVideoOff(!isVideoOff);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="mb-4 text-xl">{callStatus}</h1>
      <div className="flex space-x-4">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-1/2 h-64 bg-black rounded-lg"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-1/2 h-64 bg-black rounded-lg"
        />
      </div>
      <div className="mt-6 flex space-x-4">
        <button
          onClick={toggleAudio}
          className={`px-4 py-2 rounded-lg ${
            isMuted ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button
          onClick={toggleVideo}
          className={`px-4 py-2 rounded-lg ${
            isVideoOff ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {isVideoOff ? "Turn Video On" : "Turn Video Off"}
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;
