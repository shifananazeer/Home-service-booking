import React from 'react'
import { Link } from "react-router-dom";
interface WorkerSidebarProps {
    setCurrentComponent: (component: string) => void; 
}


const WorkerSidebar: React.FC<WorkerSidebarProps> = ({ setCurrentComponent }) => {
    return (
        <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-bold">Worker Menu</h2>
            </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    <li>
                      
                            <button
                             onClick={() => setCurrentComponent("dashboard")}
                             className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Dashboard
                            </button>
                        
                    </li>
                    <li>
                        
                            <button
                             onClick={() => setCurrentComponent("profile")} className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Profile Management
                            </button>
                        
                    </li>
                    <li>
                        
                            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Messages
                            </button>
                       
                    </li>
                    <li>
                       
                            <button 
                             onClick={() => setCurrentComponent("workerBookings")} className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Booking List
                            </button>
                       
                    </li>
                    <li>
                       
                            <button
                            onClick={() => setCurrentComponent("todaysBooking")}
                             className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Today's Work
                            </button>
                      
                    </li>
                    <li>
                      
                            <button 
                             onClick={() => setCurrentComponent("availabilityManagement")}className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Slot Management
                            </button>
                       
                    </li>
                </ul>
            </nav>
        </div>
  )
}

export default WorkerSidebar
