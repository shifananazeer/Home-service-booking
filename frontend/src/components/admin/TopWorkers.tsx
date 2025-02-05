import type React from "react";
import { useNavigate } from "react-router-dom";

interface TopWorkerProps {
  workers: {  // Change 'worker' to 'workers' and update type
    workerId: string;
    workerName: string;
    profilePic: string;
    bookingsCount: number;
  }[];
  setCurrentComponent: (component: string) => void;
  setSelectedWorkerId: (id: string) => void; 
}

const TopWorker: React.FC<TopWorkerProps> = ({ workers, setCurrentComponent, setSelectedWorkerId }) => {
  const navigate = useNavigate();

  const handleProfile = (workerId: string) => {
    setSelectedWorkerId(workerId); // Store worker ID
    setCurrentComponent("workerProfile"); // Switch to WorkerProfile
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Top Workers</h2> {/* Updated heading */}
      {workers.map(worker => ( // Map through workers array
        <div key={worker.workerId} className="flex items-center space-x-4 mb-4"> {/* Added margin bottom */}
          <img
            src={worker.profilePic || "/placeholder.svg"}
            alt={worker.workerName}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium text-lg">{worker.workerName}</h3>
            <p className="text-gray-600">Bookings: {worker.bookingsCount}</p>
          </div>
          <button onClick={() => handleProfile(worker.workerId)}>Profile</button>
        </div>
      ))}
    </div>
  );
};

export default TopWorker;
