import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface VideoCallProps {
  socket: Socket;
  roomId: string;
  userId: string;
  recipientId: string;
  recipientName: string;
  onClose: () => void;
  isInitiator: boolean;
  isVideoCall: boolean;
}

const VideoCall: React.FC<VideoCallProps> = ({
  socket,
  roomId,
  userId,
  recipientId,
  recipientName,
  onClose,
  isInitiator,
  isVideoCall
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(!isVideoCall);
  const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const initializePeerConnection = async () => {
      try {
      console.log("rooo",roomId)
        socket.emit('join-room', roomId);
        console.log("Current roomId:", roomId);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoCall,
          audio: true,
        });
        localStreamRef.current = stream;

        if (localVideoRef.current && isVideoCall) {
          localVideoRef.current.srcObject = stream;
        }

        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        stream.getTracks().forEach((track) => {
          if (localStreamRef.current) {
            peerConnection.addTrack(track, localStreamRef.current);
          }
        });

        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setIsConnected(true);
          }
        };

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', { roomId, candidate: event.candidate });
          }
        };

        peerConnectionRef.current = peerConnection;

        if (isInitiator) {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          socket.emit('offer', { roomId, caller: userId, offer });
        }
      } catch (error) {
        console.error('Error initializing peer connection:', error);
      }
    };

    

    initializePeerConnection();

    socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('answer', { roomId, answer });
      }
    });

    socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('ice-candidate', async (candidate: RTCIceCandidate) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('leave-room', () => {
      handleClose();
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      socket.emit('leave-room', roomId);
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('leave-room');
    };
  }, [socket, roomId, userId, recipientId, isInitiator, isVideoCall]);

  const handleClose = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    socket.emit('leave-room', roomId);
    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current && isVideoCall) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-4xl relative">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        <X size={24} />
      </button>
      <div className="flex flex-col items-center space-y-4">
        {isVideoCall && (
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                You
              </div>
            </div>
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                {recipientName}
              </div>
            </div>
          </div>
        )}
        {!isVideoCall && (
          <div className="w-full text-center py-8">
            <h2 className="text-2xl font-bold text-white mb-4">Audio Call with {recipientName}</h2>
            <p className="text-gray-300">{isConnected ? 'Connected' : 'Connecting...'}</p>
          </div>
        )}
        <div className="flex space-x-4">
          <button
            onClick={toggleMute}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-4 rounded-full"
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          {isVideoCall && (
            <button
              onClick={toggleVideo}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-4 rounded-full"
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
          )}
          <button
            onClick={handleClose}
            className="bg-red-500 hover:bg-red-600 text-white font-bold p-4 rounded-full"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;

