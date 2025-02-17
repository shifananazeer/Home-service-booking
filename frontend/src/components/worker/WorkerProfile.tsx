import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorkerProfileInterface, WorkerProfileResponse } from '../../interfaces/workerInterface'
import { Address } from '../../interfaces/addressInterface'
import { getWorkerProfile } from '../../services/workerService'
import { ProfileSkeleton } from '../ProfileSkelton'
import { refreshAccessToken } from '../../utils/auth'
import { logout } from '../../features/worker/workerSlice'
import { useDispatch } from 'react-redux'
import { Star } from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'

const WorkerProfile = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [workerProfile, setWorkerProfile] = useState<WorkerProfileInterface | null>(null);
    const [workerAddress, setWorkerAddress] = useState<Address | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const workerId = localStorage.getItem('workerId')

    useEffect(() => {
        const fetchProfile = async () => {
          
            try {
                            
                const data: WorkerProfileResponse = await getWorkerProfile();
                console.log("Fetched worker profile data:", data);
                setWorkerProfile(data.worker)
                setWorkerAddress(data.address)
            } catch (error: any) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])
     const handleLogout = () => {
            dispatch(logout()); 

             // Remove authentication data from localStorage
        localStorage.removeItem('workerData');
        localStorage.removeItem('worker_accessToken'); 
        localStorage.removeItem('worker_refreshToken'); 
        localStorage.removeItem('workerId')
        localStorage.removeItem('email')
        
         delete axiosInstance.defaults.headers.common["Authorization"];
    
     
         window.location.href = "/worker/login"; 
        };
    

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (error) {
        return <p className="text-center text-red-500">Error: {error}</p>;
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-900 to-blue-900 p-6">
                    <div className="flex items-center space-x-6">
                        <img
                            src={workerProfile?.profilePic || '/avathar.jpeg'}
                            alt="Profile"
                            className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-lg"
                        />
                        <div className="text-white">
                            <h1 className="text-3xl font-bold">{workerProfile?.name}</h1>
                            <p className="text-blue-100">{workerProfile?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Experience</h2>
                        <p className="text-gray-600">{workerProfile?.expirience || 'Not specified'} years</p>
                    </div>
                   
                    <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Ratings</h2>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Math.round(workerProfile?.averageRating||0 )
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-gray-400 text-sm">
                             ({(workerProfile?.averageRating ?? 0).toFixed(1)})  {/* Fallback to 0 for toFixed */}
                            </span>
                          </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {workerProfile?.skills?.length ? (
                                workerProfile.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500">No skills added</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Rate Per Hour</h2>
                        <p className="text-2xl font-bold text-blue-600">
                        ₹{workerProfile?.hourlyRate !== undefined ? workerProfile.hourlyRate.toFixed(2) : 'Not specified'}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Address</h2>
                        {workerAddress ? (
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-gray-700">{workerAddress.address}</p>
                                <p className="text-gray-500">{workerAddress.area}</p>
                            </div>
                        ) : (
                            <p className="text-gray-500">No address available.</p>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4">
                    <button
                        onClick={() => navigate('/worker/edit-profile', { state: { worker: workerProfile, address: workerAddress } })}
                        className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gra-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Edit Profile
                    </button>
                    <button 
                      onClick={handleLogout}
                    className="px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WorkerProfile

