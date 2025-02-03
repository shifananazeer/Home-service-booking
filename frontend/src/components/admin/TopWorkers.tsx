import type React from "react"

interface TopWorkerProps {
  worker: {
    workerId: string
    workerName: string
    serviceImage: string
    bookingsCount: number
  }
}

const TopWorker: React.FC<TopWorkerProps> = ({ worker }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Top Worker</h2>
      <div className="flex items-center space-x-4">
        <img
          src={worker.serviceImage || "/placeholder.svg"}
          alt={worker.workerName}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h3 className="font-medium text-lg">{worker.workerName}</h3>
          <p className="text-gray-600">Bookings: {worker.bookingsCount}</p>
        </div>
      </div>
    </div>
  )
}

export default TopWorker

