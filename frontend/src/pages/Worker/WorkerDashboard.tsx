import React from 'react'
import WorkerNavbar from './WorkerNavbar'
import WorkerSidebar from './WorkerSidebar'

const WorkerDashboard = () => {
  return (
    <div className="flex flex-col h-screen">
            <WorkerNavbar />
            <div className="flex flex-1">
                <WorkerSidebar />
                <div className="flex-1 p-6 bg-gray-100">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="mt-4">Welcome to your admin dashboard!</p>
                    {/* Add your dashboard content here */}
                </div>
            </div>
        </div>
  )
}

export default WorkerDashboard
