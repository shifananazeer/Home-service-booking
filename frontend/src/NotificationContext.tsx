import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "./utils/socket";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";

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
    console.log("Worker ID:", workerId);
    socket.emit("join-room", roomId);
    console.log("Joined room:", roomId);
    socket.emit("notification-join-room", workerId);
    

    socket.on("receive-notification", (data) => {
      console.log("New Notification:", data);
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Bell className="h-10 w-10 text-blue-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">New Notification</p>
                  <p className="mt-1 text-sm text-gray-500">{data.message}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        ),
        {
          duration: 5000,
        },
      )
    });
   
    socket.on("offerNotification", ({ roomId, userName, caller, callType, offer }) => {
      console.log("Received offerNotification", { roomId, userName, caller, callType });
   
      if (roomId === workerId) {
        setJoinedRoomId(roomId);
        setCallType(callType);
        setCaller(userName);
        setCallModel(true);
        console.log("Call model set to true"); 
      }
    });

    return () => {
      socket.off("receive-notification")
      socket.off("offerNotification");

    };
  }, [workerId]);

  const acceptCall = () => {
    if (callType === "Video") {
      navigate("/worker/videocall", { state: { caller } });
    } else if (callType === "Audio") {
   
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
          <div className="bg-gradient-to-r from-gray-800 to-blue-800 p-6 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/2 space-y-6 relative">
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

