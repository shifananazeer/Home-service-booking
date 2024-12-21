import React, { useState } from 'react'
import WorkerNavbar from './WorkerNavbar'
import WorkerSidebar from './WorkerSidebar'
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'
import { Navigate, useNavigate } from 'react-router-dom'
import WorkerProfile from '../../components/worker/WorkerProfile'
import AvailabilityManagement from '../../components/worker/AvailabilityManagement'

const WorkerDashboard = () => {
 
  const navigate = useNavigate()
  const accessToken = useSelector((state: RootState) => state.worker.accessToken);
  if(!accessToken) {
    return <Navigate to="/worker/login" replace />;
  }
   const [currentComponent, setCurrentComponent] = useState("profile"); 
   const renderComponent = () => {
    switch (currentComponent) {
        case "profile":
            return <WorkerProfile />;
        case 'availabilityManagement': 
            return <AvailabilityManagement/>
        case "dashboard":
            return (
                <>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="mt-4">Welcome to your admin dashboard!</p>
                </>
            );
        default:
            return <h1 className="text-2xl font-bold">Component Not Found</h1>;
    }
};
  return (
    <div className="flex flex-col h-screen">
    {/* Admin Navbar */}
    <WorkerNavbar />

    {/* Admin Sidebar and Main Content */}
    <div className="flex flex-1">
        {/* Sidebar */}
        <WorkerSidebar setCurrentComponent={setCurrentComponent} />

        {/* Main Content */}
        <div className="flex-1 p-6 bg-gray-100">
            {renderComponent()}
        </div>
    </div>
</div>
  )
}

export default WorkerDashboard
