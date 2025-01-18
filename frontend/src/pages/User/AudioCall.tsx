import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff } from "lucide-react";
import { useSelector } from "react-redux";
import { fetchWorkerById } from "../../services/userService";


const socket = io("http://localhost:3000");

const AudioCall = () => {
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [muted, setMuted] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [seconds, setSeconds] = useState(0);
  const [worker, setWorker] = useState<any>(null);
  const counterRef = useRef<NodeJS.Timeout | null>(null);
    const { workerId } = useParams<{ workerId: string }>();
  const roomId = workerId;
  
  const userId = localStorage.getItem('user_Id')
  useEffect(() => {
    const fetchWorkerDetails = async () => {
        if(!workerId) {
            return null
        }
      try {
      const data = await fetchWorkerById(workerId)
     
        setWorker(data.workerDetails.name);
      } catch (error) {
        console.error("Failed to fetch Worker details:", error);
      }
    };
    fetchWorkerDetails();
  }, [workerId]);
  useEffect(() => {
    socket.emit("audio-join-room", roomId);
    startCall();
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
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

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
  const startCall = async (): Promise<void> => {
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
    socket.emit("audio-offer", { roomId, caller: userId, offer });
    window.currentStream = stream;
  };

  useEffect(()=>{
       socket.on("call-disconnected", ({ roomId, userId }) => {
         if(roomId===roomId){
           setIsConnected(false);
           navigate(`/user/messages`, {
            state: { videoCallConnection: true }
          });
         }
     });
     },[])
     useEffect(()=>{
      socket.on("call-decline", ({ roomId, userId }) => {
        if(roomId===roomId){
          setIsConnected(false);
          navigate(`/user/messages`, {
           state: { videoCallDecline: true }
         });
        }
    });
    },[])
    const navigate = useNavigate();
    const cancel = () => {
      navigate(`/user/messages`, {
        state: { videoCallConnection: true }
      });
      socket.emit("leave-room", roomId);
    };
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/2 space-y-6 relative">
          {/* Close Button */}
          <button
            onClick={cancel} // Replace with your cancel handler
            className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-700 transform hover:scale-105 transition-all duration-200 ease-in-out"
          >
            Cancel
          </button>

          {/* Header */}
          <h2 className="text-3xl font-semibold text-white text-center mb-4">
            Outgoing Audio Call
          </h2>

          {/* Dialing Info */}
          <div className="flex flex-col items-center space-y-4">
            {/* Placeholder for recipient's avatar */}
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
            <p className="text-lg text-white font-medium">{worker}</p>
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
              onClick={cancel} // Replace with your cancel call handler
              className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-600 hover:scale-105 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioCall;
