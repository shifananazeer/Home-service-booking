import React from 'react'
import WorkerNavbar from './WorkerNavbar'
import WorkerSidebar from './WorkerSidebar'
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'
import { Navigate, useNavigate } from 'react-router-dom'

const WorkerDashboard = () => {
 
  const navigate = useNavigate()
  const accessToken = useSelector((state: RootState) => state.worker.accessToken);
  if(!accessToken) {
    return <Navigate to="/worker/login" replace />;
  }
  
  return (
    <div className="flex flex-col h-screen">
            <WorkerNavbar />
            <div className="flex flex-1">
                <WorkerSidebar />
                <div className="flex-1 p-6 bg-gray-100">
                    <h1 className="text-2xl font-bold">Worker Dashboard</h1>
                    <p className="mt-4">Welcome to your worker dashboard!</p>
                    
                </div>
            </div>
        </div>
  )
}

export default WorkerDashboard
