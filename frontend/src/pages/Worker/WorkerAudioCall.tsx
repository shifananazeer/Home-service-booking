import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useSelector } from "react-redux";
import socket from "../../utils/socket";


const WorkerAudioCall = () => {
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  const [muted, setMuted] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [seconds, setSeconds] = useState(0);
  const location = useLocation();
  const { caller } = location.state || {};
  const counterRef = useRef<NodeJS.Timeout | null>(null);
  const workerId = localStorage.getItem('workerId')
  const roomId = workerId;

  useEffect(() => {
    socket.emit("audio-join-room", roomId);
    acceptCall();
    socket.on("audio-offer", async (offer: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = createPeerConnection();
      }
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      setIsConnected(true);
      socket.emit("audio-answer", { roomId, answer });
    });
    socket.on("audio-answer", async (answer: RTCSessionDescriptionInit) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });
    socket.on("audio-ice-candidate", (candidate: RTCIceCandidateInit) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    });

    return () => {
      socket.off("audio-offer");
      socket.off("audio-answer");
      socket.off("audio-ice-candidate");
    };
  }, [roomId]);
  useEffect(() => {
    if (isConnected) {
      counterRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 3600) {
            clearInterval(counterRef.current!);
            setIsConnected(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (counterRef.current) {
        clearInterval(counterRef.current);
      }
    };
  }, [isConnected]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const createPeerConnection = (): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("audio-ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };
    peerConnection.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };
    return peerConnection;
  };
  const acceptCall = async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    // if (localAudioRef.current) {
    //   localAudioRef.current.srcObject = stream;
    // }
    peerConnectionRef.current = createPeerConnection();
    stream.getTracks().forEach((track) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addTrack(track, stream);
      }
    });
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit("audio-offer", { roomId, caller: workerId, offer });
    setIsConnected(true);
    window.currentStream = stream;
  };
  
  useEffect(() => {
    socket.on("call-disconnected", ({ roomId, userId }) => {
      if (roomId === roomId) {
        setIsConnected(false);
        navigate(-1);
      }
    });
  }, []);
  const navigate = useNavigate();
  const cancel = () => {
    navigate(-1);
    socket.emit("leave-room", roomId);
  };
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-gradient-to-r from-gray-800 to-blue-800 p-6 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/2 space-y-6 relative">
          {/* Close Button */}
          <button
            onClick={cancel} 
            className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-700 transform hover:scale-105 transition-all duration-200 ease-in-out"
          >
            Decline
          </button>

          {/* Header */}
          <h2 className="text-3xl font-semibold text-white text-center mb-4">
            Incoming Audio Call
          </h2>

          {/* Caller Info */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex justify-center items-center overflow-hidden shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-16 h-16 text-gray-700"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4a4 4 0 100 8 4 4 0 000-8zm0 12c-3.333 0-6 2.667-6 6s2.667 6 6 6 6-2.667 6-6-2.667-6-6-6z"
                />
              </svg>
            </div>
            <audio ref={remoteAudioRef} autoPlay />
            <p className="text-lg text-white font-medium">{caller}</p>
            {isConnected ? (
              <div>
                <p>Call in Progress: {formatTime(seconds)}</p>
              </div>
            ) : (
              <p className="text-sm text-white opacity-80">Dialing...</p>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center items-center space-x-8">
            <button
              onClick={cancel} 
              className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-600 hover:scale-105 transition-all"
            >
               <PhoneOff></PhoneOff>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkerAudioCall;
