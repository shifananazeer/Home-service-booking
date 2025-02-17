"use client"

import { useEffect, useState } from "react"
import { blockWorker, getWorkerProfile, unblockWorker } from "../../services/adminService"
import { Briefcase, Clock, IndianRupee, Star, Mail, Phone } from "lucide-react"
import toast from "react-hot-toast"

interface Worker {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  isVerified: boolean
  isBlocked: boolean
  status: string
  profilePic: string
  expirience: number
  skills: string[]
  hourlyRate: number
  isOnline: boolean
  averageRating: number
}

interface WorkerProfileProps {
  workerId: string
}

const WorkerProfile: React.FC<WorkerProfileProps> = ({ workerId }) => {
  const [worker, setWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

   const [ , setLoadingStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      try {
        if (!workerId) return
        const data = await getWorkerProfile(workerId)
        setWorker(data)
      } catch (err) {
        setError("Error fetching worker profile")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (workerId) {
      fetchWorkerProfile()
    }
  }, [workerId])


  const handleToggleBlock = async (workerId: string, isBlocked: boolean) => {
    try {
        setLoadingStatus((prev) => ({ ...prev, [workerId]: true })); 
        let response;

        if (isBlocked) {
            response = await unblockWorker(workerId);
            toast.success(`Worker ${response.worker.name} has been unblocked.`);
        } else {
            response = await blockWorker(workerId);
            toast.success(`Worker ${response.worker.name} has been blocked.`);
        }

        // Fetch updated worker profile after status change
        const updatedWorker = await getWorkerProfile(workerId);
        setWorker(updatedWorker);  

    } catch (error) {
        console.error('Failed to update user status:', error);
        setError('Failed to update user status. Please try again later.');
    } finally {
        setLoadingStatus((prev) => ({ ...prev, [workerId]: false })); 
    }
};

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (error || !worker) {
    return <div className="text-center py-10 text-red-500">{error || "Worker not found"}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-64 w-full object-cover md:w-64"
              src={worker.profilePic || "/placeholder.svg"}
              alt={worker.name}
            />
          </div>
          <div className="p-8 flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{worker.name}</h1>
                <p className="text-lg text-indigo-600 font-semibold">{worker.role}</p>
              </div>
              {/* <div
                className={`px-3 py-1 rounded-full text-sm font-semibold ${worker.isOnline ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
              >
                {worker.isOnline ? "Online" : "Offline"}
              </div> */}
            </div>

            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-gray-700 font-semibold">{worker.averageRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center bg-blue-100 rounded-full px-3 py-1">
                <Clock className="text-blue-600 w-4 h-4 mr-1" />
                <span className="text-blue-800 font-semibold">{worker.status}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{worker.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{worker.phone}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-gray-200 rounded-xl p-4 text-center">
                <Briefcase className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                <p className="text-gray-900 font-bold">{worker.expirience} Years</p>
                <p className="text-gray-500 text-sm">Experience</p>
              </div>
              <div className="bg-gray-200 rounded-xl p-4 text-center">
                <IndianRupee className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                <p className="text-gray-900 font-bold">₹{worker.hourlyRate}/hour</p>
                <p className="text-gray-500 text-sm">Hourly Rate</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              {/* <button
                className={`px-4 py-2 rounded-md text-white font-bold transition-colors ${
                  worker.isVerified ? "bg-green-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
                disabled={worker.isVerified}
              >
                {worker.isVerified ? "Verified" : "Verify"}
              </button> */}
              
              <button
              onClick={() => handleToggleBlock(worker._id, worker.isBlocked)}
               className={`mt-4 px-4 py-2 rounded-md text-white ${
                worker.isBlocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                 } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
               disabled={loading}
             >
              {loading ? "Updating..." : worker.isBlocked ? "Unblock" : "Block"}
             </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerProfile

