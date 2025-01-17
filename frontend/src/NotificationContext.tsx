// NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [callModel, setCallModel] = useState(false);
  const [caller, setCaller] = useState("");
  const [callType, setCallType] = useState("");
  const [joinedRoomId, setJoinedRoomId] = useState("");
  const workerId = localStorage.getItem('workerId')
  const roomId = workerId
  const socket: Socket = io("http://localhost:3000"); // Update with your server URL
  const navigate = useNavigate()
  useEffect(() => {
    socket.emit("join-room", roomId);
    console.log("joined in room " , roomId)
    socket.on("offerNotification", ({ roomId, userName, caller, callType }) => {
      console.log("Received offerNotification", { roomId, userName, caller, callType });
      console.log("Caller:", caller, "Worker ID:", workerId);
      if (caller === workerId) {
        setJoinedRoomId(roomId);
        setCallType(callType);
        setCaller(userName);
        setCallModel(true);
      }
    });

    return () => {
      socket.off("join-room");
      socket.off("offerNotification");
    };
  }, []);

  const acceptCall = () => {
    if (callType === "Video") {
      // Navigate to video call page
       navigate("/worker/videocall", { state: { caller } });
    } else if (callType === "Audio") {
      // Navigate to audio call page
      // navigate("/turf/customer-chat/chat/audio-call", { state: { caller } });
    }
    console.log("Call Accepted");
    setCallModel(false); // Close the call model after accepting
  };

  const declineCall = () => {
    socket.emit("leave-room-decline", roomId);
    setCallModel(false); // Close the call model after declining
  };

  return (
    <NotificationContext.Provider value={{ callModel, caller, callType, acceptCall, declineCall }}>
      {children}
      {callModel && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/2 space-y-6 relative">
            <h2 className="text-3xl font-semibold text-white text-center mb-4">
              Incoming {callType} Call
            </h2>
            <div className="flex flex-col items-center space-y-4">
              <p className="text-lg text-white font-medium">{caller}</p>
              <div className="flex justify-center items-center space-x-8">
                <button onClick={acceptCall} className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-all">
                  Accept
                </button>
                <button onClick={declineCall} className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-600 hover:scale-105 transition-all">
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};
