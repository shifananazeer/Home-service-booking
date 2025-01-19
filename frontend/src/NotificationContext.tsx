import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "./utils/socket";

interface NotificationContextType {
  callModel: boolean;
  caller: string;
  callType: string;
  acceptCall: () => void;
  declineCall: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [callModel, setCallModel] = useState(false);
  const [caller, setCaller] = useState("");
  const [callType, setCallType] = useState("");
  const [joinedRoomId, setJoinedRoomId] = useState("");
  const workerId = localStorage.getItem('workerId');
  const roomId = workerId || "";
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Worker ID:", workerId); // Add this log
    socket.emit("join-room", roomId);
    console.log("Joined room:", roomId);
   
    socket.on("offerNotification", ({ roomId, userName, caller, callType, offer }) => {
      console.log("Received offerNotification", { roomId, userName, caller, callType });
      // The worker should receive the call, so we check if the roomId matches
      if (roomId === workerId) {
        setJoinedRoomId(roomId);
        setCallType(callType);
        setCaller(userName);
        setCallModel(true);
        console.log("Call model set to true"); // Add this log
      }
    });

    return () => {
      socket.off("offerNotification");
    };
  }, [workerId]);

  const acceptCall = () => {
    if (callType === "Video") {
      navigate("/worker/videocall", { state: { caller } });
    } else if (callType === "Audio") {
      // Navigate to audio call page when implemented
      navigate('/worker/audioCall' ,{state:{caller}})
    }
    setCallModel(false);
  };

  const declineCall = () => {
    socket.emit("leave-room-decline", joinedRoomId);
    setCallModel(false);
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
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

