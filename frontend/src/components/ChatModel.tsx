import React, { useEffect, useState, useRef } from 'react';
import socket from '../utils/socket';
import { sendMessage } from '../services/userService';
import { MessageCircle, Send, X } from 'lucide-react';

interface Message {
  _id?: string;
  chatId: string;
  senderId: string;
  senderModel: 'user' | 'worker';
  text: string;
  timestamp?: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  userId: string;
  workerId: string;
  workerName: string;
  messages: Message[];
}

const ChatModal: React.FC<ChatModalProps> = ({ 
  isOpen, 
  onClose, 
  chatId, 
  userId, 
  workerId,
  workerName, 
  messages: initialMessages 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setMessages(initialMessages);
      setTimeout(scrollToBottom, 100);
      socket.emit('joinChat', chatId);
    }
  }, [isOpen, initialMessages, chatId]);

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      setTimeout(scrollToBottom, 100);
    };

    socket.on('newMessage', handleNewMessage);
    
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.emit('leaveChat', chatId);
    };
  }, [chatId]);

  const handleSendMessage = async () => {
    if (text.trim() === '') return;

    const messageData: Message = {
      chatId,
      senderId: userId,
      senderModel: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      await sendMessage(messageData);
      setText('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper function to determine if a message is from the current user
  const isUserMessage = (message: Message): boolean => {
    return message.senderModel === 'user';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center">
            <MessageCircle className="text-blue-400 w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold text-white">Chat with {workerName}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="h-[400px] overflow-y-auto p-4 bg-gray-900">
          {messages.map((message, index) => {
            const isUser = isUserMessage(message);
            return (
              <div
                key={message._id || index}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`
                    max-w-[70%] px-4 py-2 rounded-2xl
                    ${isUser ? 
                      'bg-blue-600 text-white rounded-br-none' : 
                      'bg-gray-700 text-white rounded-bl-none'
                    }
                  `}
                >
                  {!isUser && (
                    <div className="text-xs text-gray-400 mb-1">{workerName}</div>
                  )}
                  <p className="break-words">{message.text}</p>
                  {message.timestamp && (
                    <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg">
          <div className="flex">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-grow bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg flex items-center justify-center transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;

