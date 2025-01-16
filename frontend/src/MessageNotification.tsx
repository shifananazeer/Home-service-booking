import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the context type
interface MsgNotificationContextType {
  notifications: { chatId: string; count: number }[];
  addNotification: (chatId: string) => void;
  clearNotification: (chatId: string) => void;
}

// Create the context
const MsgNotificationContext = createContext<MsgNotificationContextType | undefined>(undefined);

// Provider component
export const MsgNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<{ chatId: string; count: number }[]>([]);

  const addNotification = (chatId: string) => {
    setNotifications((prev) => {
      const existing = prev.find((n) => n.chatId === chatId);
      if (existing) {
        return prev.map((n) =>
          n.chatId === chatId ? { ...n, count: n.count + 1 } : n
        );
      }
      return [...prev, { chatId, count: 1 }];
    });
  };

  const clearNotification = (chatId: string) => {
    setNotifications((prev) => prev.filter((n) => n.chatId !== chatId));
  };

  return (
    <MsgNotificationContext.Provider value={{ notifications, addNotification, clearNotification }}>
      {children}
    </MsgNotificationContext.Provider>
  );
};

// Custom hook to use the context
export const useMsgNotification = () => {
  const context = useContext(MsgNotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
