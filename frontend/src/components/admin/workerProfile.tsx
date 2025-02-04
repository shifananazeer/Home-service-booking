"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getWorkerProfile } from "../../services/adminService";

interface Worker {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  status: string;
  profilePic: string;
  experience: number;
  skills: string[];
  hourlyRate: number;
  isOnline: boolean;
  averageRating: number;
}

interface WorkerProfileProps {
  workerId: string;
}

const WorkerProfile:  React.FC<WorkerProfileProps> = ({ workerId }) => {
  
    const [worker, setWorker] = useState<Worker | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      try {
        if(!workerId) return 
        const data = await getWorkerProfile(workerId)
       
        setWorker(data);
      } catch (err) {
        setError("Error fetching worker profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (workerId) {
      fetchWorkerProfile();
    }
  }, [workerId]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error || !worker) {
    return <div className="text-center py-10 text-red-500">{error || "Worker not found"}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-48 w-full object-cover md:w-48"
              src={worker.profilePic || "/placeholder.svg"}
              alt={worker.name}
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{worker.role}</div>
            <h1 className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900">{worker.name}</h1>
            <p className="mt-2 text-gray-500">
           • {worker.status}
            </p>
            <div className="mt-4 flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-gray-600">{worker.averageRating.toFixed(1)}</span>
            </div>

            <dl className="mt-8 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{worker.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{worker.phone}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Experience</dt>
                <dd className="mt-1 text-sm text-gray-900">{worker.experience} years</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Hourly Rate</dt>
                <dd className="mt-1 text-sm text-gray-900">${worker.hourlyRate}/hour</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Skills</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <ul className="flex flex-wrap gap-2">
                    {worker.skills.map((skill, index) => (
                      <li key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex space-x-4">
              <button className={`px-4 py-2 rounded text-white font-bold ${worker.isVerified ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"}`}>
                {worker.isVerified ? "Verified" : "Verify"}
              </button>
              <button className={`px-4 py-2 rounded text-white font-bold ${worker.isBlocked ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600"}`}>
                {worker.isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
