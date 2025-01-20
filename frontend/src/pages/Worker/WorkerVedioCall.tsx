import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import socket from "../../utils/socket";



const WorkerVideoCallPage: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { caller } = location.state || {};
  const workerId = localStorage.getItem('workerId');
  const roomId = workerId;
  

  useEffect(() => {
    // Join the room
    socket.emit("join-room", roomId);
    acceptCall();

    // Listen for offer
    socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = createPeerConnection();
      }
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    
    });

  // Listen for answer
  socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  });


    // Listen for ICE candidates
    socket.on("ice-candidate", (candidate: RTCIceCandidateInit) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    });


    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [roomId]);

  const createPeerConnection = (): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    return peerConnection;
  };

 

  const acceptCall = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerConnectionRef.current = createPeerConnection();
      stream.getTracks().forEach((track) => peerConnectionRef.current!.addTrack(track, stream));

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit("offer", { roomId, caller: workerId, offer });

      setIsConnected(true);
      (window as any).currentStream = stream;

      console.log("Local stream set up");
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const toggleMute = () => {
    const audioTrack = (window as any).currentStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = (window as any).currentStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoOff(!videoTrack.enabled);
    }
  };

  useEffect(()=>{
    socket.on("call-disconnected", ({ roomId, userId }) => {
      if(roomId===roomId){
        setIsConnected(false);
        navigate(-1)
      }
  });
  },[])

  
  const cancel = () => {
    navigate(-1);
    socket.emit("leave-room", roomId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gradient-to-r from-gray-800 to-blue-800 p-6 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/2 space-y-6 relative">
        <button
          onClick={cancel}
          className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-700 transform hover:scale-105 transition-all duration-200 ease-in-out"
        >
           <PhoneOff></PhoneOff>
        </button>
        <h2 className="text-3xl font-semibold text-white text-center mb-4">
          Video Call
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-x-8 md:space-y-0">
          <div className="relative w-full md:w-1/2 flex justify-center items-center rounded-lg overflow-hidden shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-lg shadow-md"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-lg text-sm">
              You
            </div>
            {muted && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-lg text-sm">
                <MicOff className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="relative w-full md:w-1/2 flex justify-center items-center rounded-lg overflow-hidden shadow-lg">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg shadow-md"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-lg text-sm">
              {caller}
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center space-x-8">
          <button
            onClick={toggleMute}
            className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            {muted ? <Mic /> : <MicOff />}
          </button>
          {!isConnected && (
            <button
              onClick={acceptCall}
              className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
            >
              Accept
            </button>
          )}
          <button
            onClick={toggleVideo}
            className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            {videoOff ? <Video /> : <VideoOff />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerVideoCallPage;
