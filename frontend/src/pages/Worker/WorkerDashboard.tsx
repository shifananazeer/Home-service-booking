import React, { useEffect, useState } from 'react'
import WorkerNavbar from './WorkerNavbar'
import WorkerSidebar from './WorkerSidebar'
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'
import { Navigate, useNavigate } from 'react-router-dom'
import WorkerProfile from '../../components/worker/WorkerProfile'
import AvailabilityManagement from '../../components/worker/AvailabilityManagement'
import WorkerBookings from '../../components/worker/bookings'
import WorkerTodayBookings from '../../components/worker/todaysBooking'
import { refreshAccessToken } from '../../utils/auth'
import ChatList from '../../components/worker/ChatList'

const WorkerDashboard = () => {
const navigate = useNavigate()

     useEffect(()=> {
            const accessToken = localStorage.getItem('worker_accessToken')
            if(!accessToken) {
                navigate('/worker/login')
            }
        })
    
    
   const [currentComponent, setCurrentComponent] = useState("dashboard"); 
   const renderComponent = () => {
    switch (currentComponent) {
        case "profile":
            return <WorkerProfile />;
        case 'availabilityManagement': 
            return <AvailabilityManagement/>
        case 'workerBookings' :
            return <WorkerBookings/>    
        case 'todaysBooking':
              return <WorkerTodayBookings/>
        case 'chats':
            return <ChatList/>
        case "dashboard":
            return (
                <>
                    <h1 className="text-2xl font-bold">Worker Dashboard</h1>
                    <p className="mt-4">Welcome to your Worker dashboard!</p>
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
        <div className="flex-1 p-6 bg-gray-100" style={{ marginLeft: "16rem", marginTop: "4rem" }}>
            {renderComponent()}
        </div>
    </div>
</div>
  )
}

export default WorkerDashboard
