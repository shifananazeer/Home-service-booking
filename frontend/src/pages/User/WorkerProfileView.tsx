import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Phone,
  MessageCircle,
  Star,
  MapPin,
  Clock,
  Briefcase,
  IndianRupee,
  ThumbsUp,
  PenToolIcon as Tool,
} from "lucide-react"
import { fetchChat, fetchMessages, fetchReview, fetchWorkerProfile } from "../../services/userService"
import ChatModal from "../../components/ChatModel"

interface WorkerProfile {
  _id: string
  name: string
  profilePic: string
  bio?: string
  rating?: number
  totalJobs?: number
  hourlyRate: number
  location: string
  status: string
  skills: string[]
  expirience: string
  phoneNumber: string
  averageRating: number
}

interface Address {
  id: string
  userId: string
  address: string
  area: string
}

const WorkerProfilePage: React.FC = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const workerId = queryParams.get("workerId")
  const navigate = useNavigate()
  const [worker, setWorker] = useState<WorkerProfile | null>(null)
  const [address, setAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setModalOpen] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const userId = localStorage.getItem("user_Id")
  const [messages, setMessages] = useState([])
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    const loadWorkerProfile = async () => {
      try {
        if (workerId) {
          const data = await fetchWorkerProfile(workerId)
          setWorker(data.workerDetails)
          setAddress(data.address?.address || null)
          const reviewData = await fetchReview(workerId)
          setReviews(reviewData.reviews || [])
        }
      } catch (error) {
        console.error("Error fetching worker profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadWorkerProfile()
  }, [workerId])

  const handleOpenChat = async (workerId: string) => {
    try {
      if (!userId) {
        console.error("User ID is null")
        return
      }
      console.log("Fetching chat for user:", userId, "and worker:", workerId)
      const data = await fetchChat(userId, workerId)

      if (data) {
        console.log("Chat response:", data)
        setChatId(data._id) // Set the chat ID from the response
        const fetchedMessages = await fetchMessages(data._id)
        console.log("messages", fetchedMessages)
        setMessages(fetchedMessages)

        setModalOpen(true) // Open the chat modal
      } else {
        console.error("No response from fetchChat")
      }
    } catch (error) {
      console.error("Failed to fetch or create chat:", error)
    }
  }

  const handleCloseChat = () => {
    setModalOpen(false)
  }

  const toggleModal = () => {
    setIsCallModalOpen(!isCallModalOpen)
  }
  const handleVideoCall = (id: string) => {
    navigate(`/videocall/${id}`)
  }
  const handleAudioCall = (id: string) => {
    navigate(`/audioCall/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900">
        <div className="text-white text-xl">Worker not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-gray-900">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/wp.webp')",
          filter: "brightness(0.3)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 opacity-80">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
            {/* Header Section */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-blue-800">
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <img
                  className="h-32 w-32 rounded-full border-4 border-gray-800 shadow-xl object-cover"
                  src={worker.profilePic || "/avatar.jpeg"}
                  alt={worker.name}
                />
              </div>
            </div>

            {/* Profile Content */}
            <div className="pt-20 px-6 pb-6">
              <h1 className="text-3xl font-bold text-center text-white mb-2">{worker.name}</h1>

              {/* Rating & Status */}
              <div className="flex justify-center items-center space-x-4 mb-6">
                <div className="flex items-center bg-gray-700 rounded-full px-3 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(worker.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-400 text-sm">({worker.averageRating.toFixed(1)})</span>
                </div>
                <div className="flex items-center bg-green-600 rounded-full px-3 py-1">
                  <Clock className="text-white w-4 h-4 mr-1" />
                  <span className="text-white text-sm">{worker.status}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-300 text-center mb-8">
                {worker.bio || "Professional service provider ready to help you with your needs."}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-700 rounded-xl p-4 text-center">
                  <IndianRupee className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-bold">₹{worker.hourlyRate}/hour</p>
                  <p className="text-gray-300 text-sm">Hourly Rate</p>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 text-center">
                  <Briefcase className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-bold">{worker.expirience} Years</p>
                  <p className="text-gray-300 text-sm">Experience</p>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 text-center">
                  <ThumbsUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-bold">98%</p>
                  <p className="text-gray-300 text-sm">Success Rate</p>
                </div>
              </div>

              {/* Address */}
              {address && (
                <div className="bg-gray-700 rounded-xl p-4 mb-8">
                  <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                    Location
                  </h2>
                  <p className="text-gray-300">
                    {address.address}, {address.area}
                  </p>
                </div>
              )}

              {/* Skills */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Tool className="w-5 h-5 mr-2 text-blue-400" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-900 text-blue-200 text-sm font-medium px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
                  Reviews
                </h2>
                {reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="bg-gray-700 rounded-xl p-4 mb-4">
                    <p className="text-white font-semibold">{review.userName}</p>
                    <p className="text-gray-300">{review.review}</p>
                  </div>
                ))}
                {reviews.length > 3 && (
                  <button
                    onClick={() => {
                      /* TODO: Implement show more reviews functionality */
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    Show More Reviews
                  </button>
                )}
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                >
                  <Phone className="mr-2 w-5 h-5" /> Call Now
                </button>
                <button
                  onClick={() => handleOpenChat(worker._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                >
                  <MessageCircle className="mr-2 w-5 h-5" /> Start Chat
                </button>
                <ChatModal
                  isOpen={isModalOpen}
                  onClose={handleCloseChat}
                  chatId={chatId || ""}
                  userId={userId || ""}
                  workerId={worker._id}
                  messages={messages}
                  workerName={worker.name}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Choose Call Type</h3>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => handleVideoCall(worker._id || "")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all"
              >
                Video Call
              </button>
              <button
                onClick={() => handleAudioCall(worker._id || "")}
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

export default WorkerProfilePage

