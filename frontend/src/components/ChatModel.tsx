import React, { useEffect, useState, useRef, useCallback } from 'react';
import socket from '../utils/socket';
import { sendingMessage } from '../services/userService';
import { MessageCircle, Send, X, ImageIcon } from 'lucide-react';

export interface Message {
  _id?: string;
  chatId: string;
  senderId: string;
  senderModel: 'user' | 'worker';
  text?: string;
  reactions?: Reaction[];
  mediaUrl?: string; 
  isSeen?: boolean;
  seenBy?: string;
  timestamp?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface Reaction {
  userModel: string;
  emoji: string;
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
  workerName, 
  messages: initialMessages 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markMessagesAsSeen = useCallback((unseenMessages: Message[]) => {
    const unseenMessageIds = unseenMessages
      .filter(msg => msg.senderModel !== 'user' && !msg.isSeen)
      .map(msg => msg._id!);
  
    if (unseenMessageIds.length > 0) {
      // Emit to the server to mark messages as seen
      socket.emit('markAsSeen', { unseenMessageIds, chatId });
  
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          unseenMessageIds.includes(msg._id!) ? { ...msg, isSeen: true } : msg
        )
      );
    }
  }, [chatId]);

  useEffect(() => {
    if (isOpen) {
      setMessages(prevMessages => {
        const uniqueMessages = [...new Map([...prevMessages, ...initialMessages].map(msg => [msg._id, msg])).values()];
        return uniqueMessages;
      });
      setTimeout(scrollToBottom, 100);
      socket.emit('joinChat', { chatId });
      markMessagesAsSeen(initialMessages);
    }
  }, [isOpen, initialMessages, chatId, markMessagesAsSeen]);

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages(prev => {
        if (!prev.some(msg => msg._id === message._id)) {
          return [...prev, message];
        }
        return prev;
      });
      setTimeout(scrollToBottom, 100);
      if (message.senderModel !== 'user') {
        markMessagesAsSeen([message]);
      }
    };
  
    socket.on('newMessage', handleNewMessage);
  
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, []);

  const handleSendMessage = async () => {
    if (text.trim() === '' && !mediaFile) return;
  
    const newMessage: Message = {
      _id: `temp-${Date.now()}`, // Temporary ID to prevent duplicates
      chatId,
      senderId: userId,
      senderModel: 'user',
      timestamp: new Date().toISOString(),
      text: text.trim() || undefined,
    };
  
    // **Optimistically update UI**
    setMessages((prev) => [...prev, newMessage]);
    setText('');
    setMediaFile(null);
    setMediaPreview(null);
    scrollToBottom();
  
    try {
      await sendingMessage(newMessage, mediaFile);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  useEffect(() => {
    const handleSeenStatusUpdate = (seenMessageIds: string[]) => {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          seenMessageIds.includes(msg._id!) ? { ...msg, isSeen: true } : msg
        )
      );
    };
  
    socket.on('seenStatusUpdated', handleSeenStatusUpdate);
    
    return () => {
      socket.off('seenStatusUpdated', handleSeenStatusUpdate);
    };
  }, []);


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setMediaFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isUserMessage = (message: Message): boolean => {
    return message.senderModel === 'user';
  };

  const addReaction = (messageId: string, emoji: string) => {
    // Emit the addReaction event to the server
    socket.emit('addReaction', { messageId, emoji });
   
  };

  useEffect(() => {
   
    socket.on('reactionUpdated', (data) => {
      const { messageId, reactionData } = data;
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === messageId 
            ? { ...msg, reactions: [...(msg.reactions || []), reactionData] }
            : msg
        )
      );
    });
    return () => {
      socket.off('reactionUpdated');
    };
  }, []);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-4">
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
                    max-w-[70%] px-4 py-2 rounded-2xl relative group
                    ${isUser ? 
                      'bg-blue-600 text-white rounded-br-none' : 
                      'bg-gray-700 text-white rounded-bl-none'
                    }
                  `}
                >
                  {!isUser && (
                    <div className="text-xs text-gray-400 mb-1">{workerName}</div>
                  )}
                  {message.mediaUrl && (
                    <img 
                      src={message.mediaUrl} 
                      alt="Sent image" 
                      className="max-w-full h-auto rounded-lg mb-2"
                    />
                  )}
                   {isUser && message.isSeen && (
                    <p className="text-xs mt-1 text-blue-200">Seen</p>
                   )}
                  <p className="break-words">{message.text}</p>
                  {message.updatedAt && (
                    <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(message.updatedAt).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </p>
                  )}
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
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg">
          <div className="flex items-center">
            <button
              onClick={triggerFileInput}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-l-lg flex items-center justify-center transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-grow bg-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg flex items-center justify-center transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
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
      </div>
    </div>
  );
};

export default ChatModal;

