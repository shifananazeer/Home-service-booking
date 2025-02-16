import React from 'react'
import { Link } from "react-router-dom";
interface WorkerSidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    setCurrentComponent: (component: string) => void;
  }
  
  const WorkerSidebar: React.FC<WorkerSidebarProps> = ({ isOpen, toggleSidebar, setCurrentComponent }) => {
    const handleComponentChange = (component: string) => {
        setCurrentComponent(component);
        toggleSidebar(); // Close sidebar when changing components
    };
    return (
        <div
        className={`fixed top-16 left-0 h-full bg-gray-800 text-white w-64 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
      >
              {/* Sidebar Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-lg font-bold">Worker Menu</h2>
        <button className="text-white md:hidden" onClick={toggleSidebar}>X</button>
      </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    <li>
                      
                            <button
                             onClick={() => handleComponentChange("dashboard")}
                             className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Dashboard
                            </button>
                        
                    </li>
                    <li>
                        
                            <button
                             onClick={() => handleComponentChange("profile")} className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Profile Management
                            </button>
                        
                    </li>
                    <li>
                        
                            <button 
                             onClick={() => handleComponentChange("chats")}className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Messages
                            </button>
                       
                    </li>
                    <li>
                       
                            <button 
                             onClick={() => handleComponentChange("workerBookings")} className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Booking List
                            </button>
                       
                    </li>
                    <li>
                       
                            <button
                            onClick={() => handleComponentChange("todaysBooking")}
                             className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Today's Work
                            </button>
                      
                    </li>
                    <li>
                      
                            <button 
                             onClick={() =>handleComponentChange("availabilityManagement")}className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Slot Management
                            </button>
                       
                    </li>
                    <li>
                      
                      <button 
                       onClick={() => handleComponentChange("walletAndRevenue")}className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                          Wallet & Revenue
                      </button>
                 
              </li>
              <li>
                      
                      <button 
                       onClick={() =>handleComponentChange("revenue")}className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                         Revenue
                      </button>
                 
              </li>
                </ul>
            </nav>
        </div>
  )
}

export default WorkerSidebar
