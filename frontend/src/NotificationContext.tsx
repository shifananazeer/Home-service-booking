// NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import socket from './utils/socket';
import { useChat } from './ChatContext';

// Define the structure of the notification
interface Notification {
  chatId: string;
  senderId: string;
  content: string;
}


const NotificationContext = createContext<any>(null);


export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { chatIds } = useChat(); // Access chatId from ChatContext
  const [notifications, setNotifications] = useState<Notification[]>([]); // Updated type for notifications

  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, { chatId: '', senderId: '', content: message }]); // Adjust based on your use case
  };

  
  console.log('Current Chat ID:', chatIds); 

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server for notifications');

      // Emit JOIN_CHAT event to join the specific chat room if chatId is not null
      // chatIds.forEach((chatId: any)=> {
        socket.emit('joinChat', '6780fe3632fa61799a45f875');
        console.log(`Joined chat with ID: `);
      // }
    
    });

    // Listen for new message notifications
    socket.on('newMessageNotification', (notification: Notification) => {
      console.log('New message notification received:', notification);
      setNotifications((prev) => [...prev, notification]);
      toast.success("New Message");
    });

    // Cleanup on unmount
    return () => {
      socket.off('newMessageNotification');
      socket.disconnect();
    };
  }, [chatIds]); 

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};


export const useNotification = () => {
  return useContext(NotificationContext);
};
