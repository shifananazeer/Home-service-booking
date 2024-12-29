import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorkerProfileInterface, WorkerProfileResponse } from '../../interfaces/workerInterface'
import { Address } from '../../interfaces/addressInterface'
import { getWorkerProfile } from '../../services/workerService'
import { ProfileSkeleton } from '../ProfileSkelton'

const WorkerProfile = () => {
    const navigate = useNavigate()
    const [workerProfile , setWorkerProfile] = useState<WorkerProfileInterface | null> (null);
    const [workerAddress , setWorkerAddress] = useState <Address | null>(null);
    const [loading , setLoading ] = useState<boolean> (true);
     const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const fetchProfile = async () => {
            try{
              const data:WorkerProfileResponse = await getWorkerProfile();
              console.log("Fetched worker profile data:", data);
              setWorkerProfile(data.worker)
              setWorkerAddress(data.address)
            }catch (error:any) {
             setError(error.message)
            }finally {
             setLoading(false)
            }
        }
        fetchProfile()
},[])
     if (loading) {
            return <ProfileSkeleton />;
        }
    
        if (error) {
            return <p className="text-center text-red-500">Error: {error}</p>;
        }
    
  return (
   
    <div className="flex-1 p-8 bg-white shadow-md rounded-lg mx-4">
    <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
        <img
            src={workerProfile?.profilePic ||'/avathar.jpeg'}
            alt="Profile"
            className="h-24 w-24 object-cover rounded-full border-4 border-gray-300 shadow-md"
        />
        <div>
            <h1 className="text-2xl font-bold">
         Name : {workerProfile?.name}
            </h1>
            <p className="text-gray-600">{workerProfile?.email}</p>
            <p className="text-gray-600">Experience:{workerProfile?.expirience}</p>
            <div className="text-gray-600">
            <p>Skills:</p>
<div className="flex flex-wrap gap-2 mt-2">
  {workerProfile?.skills?.length ? (
    workerProfile.skills.map((skill, index) => (
      <span
        key={index}
        className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
      >
        {skill}
        {index < workerProfile.skills.length - 1 && ', '} 
      </span>
    ))
  ) : (

    <span className="text-gray-500">No skills added</span>

  )}
 
</div>

<h2>Rate Per Hour:  <span className='text-red-700 font-extrabold'> {workerProfile?.hourlyRate !== undefined ? workerProfile.hourlyRate : 'Not specified'}</span></h2>

</div>
        </div>
    </div>

   <div className="mt-4">
        <h2 className="text-xl font-semibold">Address</h2>
       {workerAddress? (
        <div className="border-b py-2">
        <p>{workerAddress.address}</p>
        <p className="text-gray-500">{workerAddress.area}</p>
    </div>
       ):(
        <p className="text-gray-700">No address available.</p>
       )
       }
            
           
    
    </div>
    <div className="mt-6 flex space-x-4">
        <button
            onClick={() => navigate('/worker/edit-profile', { state: { worker: workerProfile , address: workerAddress} })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
            Edit Profile
        </button>
        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">
            Logout
        </button>
    </div>
</div>

  )
}

export default WorkerProfile
