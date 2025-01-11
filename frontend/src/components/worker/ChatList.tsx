import React, { useEffect, useState, useRef } from "react";
import { fetchChats, fetchMessages, sendMessages } from "../../services/workerService";
import socket from '../../utils/socket';

// Define the interface for the chat object
interface Chat {
  _id: string; // MongoDB ObjectId
  userInfo: {
    firstName: string;
    profilePic: string;
  };
  isSelected?: boolean; // Optional property if selection is handled
}

// Define the interface for the message object
export interface Message {
  _id?: string;            // Message ID
  senderId: string;        // Sender ID
  senderModel: string;     // Model of the sender (e.g., "user" or "worker")
  text: string;            // The message content
  chatId: string;          // ID of the associated chat
  timestamp?: string;      // Optional timestamp
}

const ChatList: React.FC = () => {
  const workerId = localStorage.getItem("workerId");
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [text, setText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Reference for messages container

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
      setShowModal(true);
      socket.emit('joinChat', chatId); // Join the chat room
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (text.trim() === '') return;
    if (!selectedChat) {
      console.error("No chat selected");
      return; // Exit if no chat is selected
    }

    const messageData: Message = {
      senderId: workerId || "",
      senderModel: "worker",
      text: text.trim(),
      chatId: selectedChat._id,
      timestamp: new Date().toISOString(),
    };

    try {
      await sendMessages(messageData);
      setText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Scroll to the bottom of the messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom(); // Scroll to the bottom when a new message arrives
    };

    socket.on('newMessage', handleNewMessage);
    
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom when messages are loaded or updated
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4 p-4">
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="flex items-center p-4 rounded-2xl bg-gray-200 cursor-pointer hover:shadow-lg transition"
          onClick={() => {
            setSelectedChat(chat);
            loadMessages(chat._id);
          }}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
            <img
              src={chat.userInfo?.profilePic || "/default-profile.png"}
              alt={`${chat.userInfo?.firstName || "User"}'s Profile`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {chat.userInfo?.firstName || "Unknown User"}
            </div>
            <div className="text-sm text-gray-600">1 Unread Message</div>
          </div>
        </div>
      ))}

      {/* Modal for Messages */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <div className="flex flex-col space-y-4 h-64 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`p-2 rounded-lg ${
                      message.senderModel === "worker"
                        ? "bg-blue-500 text-white self-end"
                        : "bg-gray-200 text-black self-start"
                    }`}
                  >
                    {message.text}
                  </div>
                ))
              ) : (
                <div className="text-gray-600">No messages yet.</div>
              )}
              <div ref={messagesEndRef} /> {/* Reference for scrolling */}
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="w-full border rounded-lg p-2 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
