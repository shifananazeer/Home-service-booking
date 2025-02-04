import type React from "react"
import { useNavigate } from "react-router-dom"

interface TopWorkerProps {
  worker: {
    workerId: string
    workerName: string
    profilePic: string
    bookingsCount: number
  }
  setCurrentComponent: (component: string) => void;  // Add setCurrentComponent as a prop
  setSelectedWorkerId: (id: string) => void; 
}



const TopWorker: React.FC<TopWorkerProps> = ({ worker  , setCurrentComponent  , setSelectedWorkerId}) => {
  const navigate = useNavigate()
  const handleProfile = (workerId:string) => {
    setSelectedWorkerId(workerId); // Store worker ID
    setCurrentComponent("workerProfile"); // Switch to WorkerProfile
  }
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Top Worker</h2>
      <div className="flex items-center space-x-4">
        <img
          src={worker.profilePic || "/placeholder.svg"}
          alt={worker.workerName}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h3 className="font-medium text-lg">{worker.workerName}</h3>
          <p className="text-gray-600">Bookings: {worker.bookingsCount}</p>
        </div>
        <button onClick={()=>handleProfile(worker.workerId)}>Profile</button>
      </div>
    </div>
  )
}

export default TopWorker

