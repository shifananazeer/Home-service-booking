// ChatContext.tsx
import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext<any>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatIds, setChatIds] = useState<string[]>([]); // Changed to an array

  const updateChatIds = (newChatIds: string[]) => {
    setChatIds(newChatIds);
  };

  return (
    <ChatContext.Provider value={{ chatIds, updateChatIds }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  return useContext(ChatContext);
};
