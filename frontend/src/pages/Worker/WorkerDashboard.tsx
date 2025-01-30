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

import socket from '../../utils/socket'
import ChatList from '../../components/worker/ChatList'
import { revenueDataForWorker } from '../../services/workerService'
import RevenueChart from '../../components/worker/RevenueChart'


interface RevenueData {
    month: string;
    revenue: number;
}


const defaultMonths: string[] = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const WorkerDashboard = () => {
const navigate = useNavigate()
const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
const workerId = localStorage.getItem('workerId')
useEffect(() => {
    const accessToken = localStorage.getItem("worker_accessToken");
    if (!accessToken) {
        navigate("/worker/login");
    }

    const fetchRevenueData = async () => {
        if (!workerId) return;
        try {
            const data = await revenueDataForWorker(workerId);

            // Map API data for quick lookup
            const revenueMap = new Map(data?.map((item: RevenueData) => [item.month, item.revenue]));

            // Ensure all months are present with default revenue 0
            const formattedData: RevenueData[] = defaultMonths.map((month) => ({
                month,
                revenue: Number(revenueMap.get(month) || 0), // Ensure revenue is always a number
            }));

            setRevenueData(formattedData);
        } catch (error) {
            console.error("Error fetching revenue data:", error);
        }
    };

    fetchRevenueData();
}, [workerId, navigate]);
    
    
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
                       {/* Add revenue chart here */}
                       {revenueData.length > 0 ? (
                            <RevenueChart revenueData={revenueData} />
                        ) : (
                            <p>Loading revenue data...</p>
                        )}
                </>
            );
        default:
            return <h1 className="text-2xl font-bold">Component Not Found</h1>;
    }
};
  return (
    <div className="flex flex-col h-screen ">
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
