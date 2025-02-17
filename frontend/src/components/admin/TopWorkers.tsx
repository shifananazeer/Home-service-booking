import type { FC } from "react"
import { useNavigate } from "react-router-dom"

interface TopWorkerProps {
  workers: {
    workerId: string
    workerName: string
    profilePic: string
    bookingsCount: number
  }[]
  setCurrentComponent: (component: string) => void
  setSelectedWorkerId: (id: string) => void
}

const TopWorker: FC<TopWorkerProps> = ({ workers, setCurrentComponent, setSelectedWorkerId }) => {
  const navigate = useNavigate()

  const handleProfile = (workerId: string) => {
    setSelectedWorkerId(workerId)
    setCurrentComponent("workerProfile")
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Top Workers</h2>
      {workers.map((worker) => (
        <div key={worker.workerId} className="flex items-center justify-between mb-4">
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
          </div>
          <button
            onClick={() => handleProfile(worker.workerId)}
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Profile
          </button>
        </div>
      ))}
    </div>
  )
}

export default TopWorker

