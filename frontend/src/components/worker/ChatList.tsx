import React, { useEffect, useState, useRef } from "react";
import { fetchChats, fetchMessages, sendMessages, sendReaction } from "../../services/workerService";
import socket from '../../utils/socket';

interface Chat {
  _id: string;
  userInfo: {
    firstName: string;
    profilePic: string;
  };
}

export interface Reaction {
  userModel: string;
  emoji: string;
}

export interface Message {
  _id?: string;
  senderId: string;
  senderModel: "user" | "worker";
  text?: string;
  reactions?: Reaction[];
  mediaUrl?: string;
  chatId: string;
  timestamp?: string;
  createdAt?: string;
}

const ChatList: React.FC = () => {
  const workerId = localStorage.getItem("workerId");
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadChats = async () => {
      if (!workerId || workerId.length !== 24) {
        console.error("Invalid Worker ID:", workerId);
        return;
      }

      try {
        const chats: Chat[] = await fetchChats(workerId);
        setChats(chats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    loadChats();
  }, [workerId]);

  const loadMessages = async (chatId: string) => {
    try {
      const messages = await fetchMessages(chatId);
      setMessages(messages);
      socket.emit('joinChat', chatId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!selectedChat) {
      console.error("No chat selected");
      return;
    }
  
    const messageData: Message = {
      senderId: workerId || "",
      senderModel: "worker",
      chatId: selectedChat._id,
      timestamp: new Date().toISOString(),
    };
  
    if (text.trim() !== '') {
      messageData.text = text.trim();
    }
  
    try {
      await sendMessages(messageData, mediaFile);
      setText('');
      setMediaFile(null);
      setMediaPreview(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    socket.on('newMessage', handleNewMessage);
    
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setMediaFile(file);
    
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const reactionData = { emoji, userModel: 'worker' }; // Include userModel in the reaction data
      const response = await sendReaction(messageId, reactionData);
      console.log("Reaction added:", response);
      // Update the local state to reflect the new reaction
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId 
            ? { ...msg, reactions: [...(msg.reactions || []), reactionData] }
            : msg
        )
      );
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 bg-white overflow-y-auto border-r border-gray-200">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Chats</h2>
          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                selectedChat?._id === chat._id ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setSelectedChat(chat);
                loadMessages(chat._id);
              }}
            >
              <img
                src={chat.userInfo?.profilePic || "/default-profile.png"}
                alt={`${chat.userInfo?.firstName || "User"}'s Profile`}
                className="w-12 h-12 rounded-full mr-3 object-cover"
              />
              <div>
                <div className="font-semibold">
                  {chat.userInfo?.firstName || "Unknown User"}
                </div>
                <div className="text-sm text-gray-500">1 Unread Message</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="bg-white p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {selectedChat.userInfo?.firstName || "Unknown User"}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`mb-4 flex ${
                    message.senderModel === "worker" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg relative group ${
                      message.senderModel === "worker"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {message.text && <p>{message.text}</p>}
                    {message.mediaUrl && (
                      <img src={message.mediaUrl} alt="media" className="max-w-full mt-2 rounded" />
                    )}
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt || "").toLocaleTimeString([], { hour: "numeric", minute: "numeric" })}
                    </p>
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex mt-1 space-x-1">
                        {message.reactions.map((reaction, index) => (
                          <span key={index} className="text-sm">{reaction.emoji}</span>
                        ))}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 mb-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => addReaction(message._id!, "👍")}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        👍
                      </button>
                      <button
                        onClick={() => addReaction(message._id!, "❤️")}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="bg-white p-4 border-t border-gray-200">
              <div className="flex items-center">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  📎
                </button>
                <button
                  onClick={sendMessage}
                  className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
              </div>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              {mediaPreview && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={mediaPreview}
                    alt="Media Preview"
                    className="max-w-xs max-h-32 rounded"
                  />
                  <button
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview(null);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <p className="text-xl text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;

