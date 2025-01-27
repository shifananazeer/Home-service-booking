import type React from "react"
import { useEffect, useState, useRef } from "react"
import { fetchChats, fetchMessages, fetchUnreadMessags, sendMessages, sendReaction } from "../../services/workerService"
import socket from "../../utils/socket"
import { Phone } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Chat {
  _id: string
  userInfo: {
    _id: string
    firstName: string
    profilePic: string
  }
  lastMessage?: Message
}

export interface Reaction {
  userModel: string
  emoji: string
}

export interface Message {
  _id?: string
  senderId: string
  senderModel: "user" | "worker"
  text?: string
  reactions?: Reaction[]
  mediaUrl?: string
  chatId: string
  timestamp?: string
  createdAt?: string
  isSeen?: boolean
  seenBy?: string
}

const ChatList: React.FC = () => {
  const workerId = localStorage.getItem("workerId")
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState<string>("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleConnect = () => {
      console.log("Successfully connected to the server!")
      socket.emit("join", workerId) // Emit the 'join' event when connected
    }

    const handleOnlineUsersList = (onlineUsers: any) => {
      console.log("Online users:", onlineUsers) // Log the list of online users
      setOnlineUsers(onlineUsers)
    }

    // Attach the 'connect' listener
    socket.on("connect", handleConnect)

    // Fetch the list of online users
    socket.emit("getOnlineUsers")

    // Listen for the online users list
    socket.on("onlineUsersList", handleOnlineUsersList)

    // Call the handleConnect immediately if already connected
    if (socket.connected) {
      handleConnect()
    }

    // Cleanup function to remove listeners
    return () => {
      socket.off("connect", handleConnect)
      socket.off("onlineUsersList", handleOnlineUsersList)
    }
  }, [workerId])

  useEffect(() => {
    const loadChats = async () => {
      if (!workerId || workerId.length !== 24) {
        console.error("Invalid Worker ID:", workerId)
        return
      }

      try {
        const chats: Chat[] = await fetchChats(workerId)
        const unreadMessages = await fetchUnreadMessags(workerId)
        const counts = unreadMessages.reduce((acc: { [x: string]: any }, { _id: chatId, count }: any) => {
          acc[chatId] = count
          return acc
        }, {})
        setUnreadCounts(counts)
        const sortedChats = chats.sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || 0).getTime() - new Date(a.lastMessage?.createdAt || 0).getTime(),
        )

        setChats(sortedChats)
      } catch (error) {
        console.error("Error fetching chats:", error)
      }
    }

    loadChats()
  }, [workerId])

  const loadMessages = async (chatId: string) => {
    if (selectedChat) {
      socket.emit("leaveChat", { chatId: selectedChat._id })
    }

    try {
      const messages = await fetchMessages(chatId)
      setMessages(messages)

      const unseenMessageIds = messages
        .filter((msg: Message) => msg.senderModel !== "worker" && !msg.isSeen)
        .map((msg: Message) => msg._id)

      if (unseenMessageIds.length > 0) {
        socket.emit("markAsSeen", { unseenMessageIds, chatId })
      }

      socket.emit("joinChat", { chatId })
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  useEffect(() => {
    const handleSeenStatusUpdate = (unseenMessageIds: (string | undefined)[]) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (unseenMessageIds.includes(msg._id) ? { ...msg, isSeen: true } : msg)),
      )
    }

    socket.on("seenStatusUpdated", handleSeenStatusUpdate)

    return () => {
      socket.off("seenStatusUpdated", handleSeenStatusUpdate)
    }
  }, [])

  const sendMessage = async () => {
    if (!selectedChat) {
      console.error("No chat selected")
      return
    }

    const messageData: Message = {
      senderId: workerId || "",
      senderModel: "worker",
      chatId: selectedChat._id,
      timestamp: new Date().toISOString(),
    }

    if (text.trim() !== "") {
      messageData.text = text.trim()
    }

    try {
      await sendMessages(messageData, mediaFile)
      setText("")
      setMediaFile(null)
      setMediaPreview(null)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message])
      scrollToBottom()
    }

    socket.on("newMessage", handleNewMessage)

    return () => {
      socket.off("newMessage", handleNewMessage)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    setMediaFile(file)

    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setMediaPreview(previewUrl)
    }
  }

  const addReaction = (messageId: string, emoji: string) => {
    socket.emit("addReaction", { messageId, emoji })
  }

  useEffect(() => {
    socket.on("reactionUpdated", (data) => {
      const { messageId, emoji, reactionData } = data
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: [...(msg.reactions || []), reactionData] } : msg,
        ),
      )
    })

    return () => {
      socket.off("reactionUpdated")
    }
  }, [])

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  const handleVideoCall = (id: string) => {
    navigate(`/worker/videocall`) // Replace with your actual route for the video call page
  }
  const handleAudioCall = (id: string) => {
    navigate(`/worker/audioCall`)
  }
  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100 ">
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 sticky top-[20px]  bg-white z-10 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Chats</h2>
        </div>
        <div className="p-6">
          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                selectedChat?._id === chat._id ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
              onClick={() => {
                setSelectedChat(chat)
                loadMessages(chat._id)
                setUnreadCounts((prevCounts) => ({
                  ...prevCounts,
                  [chat._id]: 0,
                }))
              }}
            >
              <div className="relative">
                <img
                  src={chat.userInfo?.profilePic || "/default-profile.png"}
                  alt={`${chat.userInfo?.firstName || "User"}'s Profile`}
                  className="w-12 h-12 rounded-full mr-3 object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                    onlineUsers.includes(chat.userInfo._id) ? "bg-green-500" : "bg-gray-500"
                  }`}
                ></span>
                {/* Unread Messages Badge */}
                {unreadCounts[chat._id] > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                    {unreadCounts[chat._id]}
                  </span>
                )}
              </div>
              <div>
                <div className="font-semibold">{chat.userInfo?.firstName || "Unknown User"}</div>
                <div className="text-sm text-gray-500">
                  {onlineUsers.includes(chat.userInfo._id) ? "Online" : "Offline"}
                </div>
                <div className="text-sm text-gray-500">
                  <p>
                    {chat.lastMessage?.text} :{" "}
                    {chat.lastMessage?.createdAt ? formatTime(chat.lastMessage.createdAt) : ""}
                  </p>
                </div>
              </div>
              <div className="justify-between ml-20">
                <button
                  onClick={toggleModal}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-105"
                  style={{ fontSize: "0.9rem" }}
                >
                  <Phone className="text-white mr-1" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="bg-white p-4 border-b border-gray-200 sticky top-[64px] z-20">
              {" "}
              {/* Update 1 */}
              <div className="flex items-center">
                <h2 className="text-xl font-semibold mr-2">{selectedChat.userInfo?.firstName || "Unknown User"}</h2>
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    onlineUsers.includes(selectedChat.userInfo._id) ? "bg-green-500" : "bg-gray-500"
                  }`}
                ></span>
                <span className="ml-2 text-sm text-gray-500">
                  {onlineUsers.includes(selectedChat.userInfo._id) ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pt-0" style={{ height: "calc(100vh - 180px)" }}>
              {" "}
              {/* Update 2 */}
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`mb-4 flex ${message.senderModel === "worker" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg relative group ${
                      message.senderModel === "worker" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                    }`}
                  >
                    {message.text && <p>{message.text}</p>}
                    {message.mediaUrl && (
                      <img
                        src={message.mediaUrl || "/placeholder.svg"}
                        alt="media"
                        className="max-w-full mt-2 rounded"
                      />
                    )}
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt || "").toLocaleTimeString([], { hour: "numeric", minute: "numeric" })}
                    </p>
                    {message.senderModel === "worker" && message.isSeen && (
                      <p className="text-xs mt-1 text-blue-200">Seen</p>
                    )}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex mt-1 space-x-1">
                        {message.reactions.map((reaction, index) => (
                          <span key={index} className="text-sm">
                            {reaction.emoji}
                          </span>
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
            <div className="bg-white p-4 border-t border-gray-200 sticky bottom-0 z-20">
              {" "}
              {/* Update 3 */}
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
                    src={mediaPreview || "/placeholder.svg"}
                    alt="Media Preview"
                    className="max-w-xs max-h-32 rounded"
                  />
                  <button
                    onClick={() => {
                      setMediaFile(null)
                      setMediaPreview(null)
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
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Choose Call Type</h3>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => handleVideoCall(selectedChat?.userInfo._id || "")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all"
              >
                Video Call
              </button>
              <button
                onClick={() => handleAudioCall(selectedChat?.userInfo._id || "")}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-all"
              >
                Audio Call
              </button>
            </div>
            <button onClick={toggleModal} className="mt-4 text-gray-500 hover:text-gray-700 text-sm underline">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatList

