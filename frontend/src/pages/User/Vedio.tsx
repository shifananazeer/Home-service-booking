import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { MicOff } from 'lucide-react';
import { fetchWorkerById } from "../../services/userService";

declare global {
    interface Window {
      currentStream: MediaStream | null;
    }
  }

const socket = io("http://localhost:3000");

const VideoCall = () => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [worker, setWorker] = useState<string | null>(null);
  const [, setIsConnected] = useState<boolean>(false);
  const { id } = useParams();
  const roomId = id as string; // Ensure roomId is a string
  const userId = localStorage.getItem('user_Id');

  const navigate = useNavigate();

  useEffect(() => {
    const handleCallDisconnected = ({ roomId: disconnectedRoomId, userId }: { roomId: string; userId: string }) => {
        console.log(`User ${userId} disconnected from room ${disconnectedRoomId}`);
        if (disconnectedRoomId === roomId) {
          setIsConnected(false);
          navigate(`/user/messages`, { state: { videoCallConnection: true } });
        }
      };

    socket.on("call-disconnected", handleCallDisconnected);
    
    return () => {
      socket.off("call-disconnected", handleCallDisconnected);
    };
  }, [roomId, navigate]);

  useEffect(() => {
    socket.emit("join-room", roomId);
    startCall();

    socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = createPeerConnection();
      }
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    });

    socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", (candidate: RTCIceCandidateInit) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [roomId]);

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      if (!id) {
        return;
      }
      try {
        const data = await fetchWorkerById(id);
        setWorker(data.workerDetails.name);
      } catch (error) {
        console.error("Failed to fetch worker details:", error);
      }
    };
    fetchWorkerDetails();
  }, [id]);

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

  const startCall = async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    peerConnectionRef.current = createPeerConnection();
    stream.getTracks().forEach((track) => peerConnectionRef.current!.addTrack(track, stream));

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit("offer", { roomId, caller: userId, offer });
    setIsConnected(true);
    window.currentStream = stream; // Store the stream in the global window object
  };

  const toggleMute = () => {
    const audioTrack = window.currentStream?.getAudioTracks()[0];
    if (audioTrack) {
      setMuted((prev) => !prev);
      audioTrack.enabled = !audioTrack.enabled; // Toggle the enabled state
    }
  };

  const toggleVideo = () => {
    const videoTrack = window.currentStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled; // Toggle the enabled state
    }
  };

  const cancel = () => {
    navigate(`/user/messages`, { state: { videoCallConnection: true } });
    socket.emit("leave-room", roomId);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-gradient-to-r from-gray-900 to-gray-500 p-6 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/2 space-y-6 relative">
          <button
            onClick={cancel}
            className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-700 transform hover:scale-105 transition-all duration-200 ease-in-out"
          >
            Cancel
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
                style={{ width: "100%", borderRadius: "10px", border: "5px solid #fff" }}
                className="rounded-lg shadow-md"
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
                style={{ width: "100%", borderRadius: "10px", border: "5px solid #fff" }}
                className="rounded-lg shadow-md"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-lg text-sm">
                {worker} {/* Corrected variable name */}
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center space-x-8">
            <button
              onClick={toggleMute}
              className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              {muted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={cancel}
              className="bg-red-600 text-white px-6 py-4 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              Cancel
            </button>
            <button
              onClick={toggleVideo}
              className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              Video Off
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoCall;
