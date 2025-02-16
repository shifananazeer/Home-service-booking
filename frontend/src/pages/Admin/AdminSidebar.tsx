// src/components/AdminSidebar.jsx
import React from "react";


interface AdminSidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    setCurrentComponent: (component: string) => void;
    
  }


const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, toggleSidebar, setCurrentComponent }) => {
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
           <div className="p-4 flex justify-between items-center border-b border-gray-700">
                <h2 className="text-lg font-bold">Admin Menu</h2>
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
                             onClick={() => handleComponentChange("userManagement")}
                            className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                User Management
                            </button>
                       
                    </li>
                    <li>
                       
                            <button 
                              onClick={() => handleComponentChange("workerManagement")}
                            className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Worker Management
                            </button>
                       
                    </li>
                    <li>
                        
                            <button
                               onClick={() => handleComponentChange("bookings")}
                                className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Booking List
                            </button>
                        
                    </li>
                    <li>
                      
                            <button 
                              onClick={() => handleComponentChange("serviceManagement")}
                            className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Service Management
                            </button>
                       
                    </li>

                    <li>
                      
                      <button 
                        onClick={() => handleComponentChange("wallet")}
                      className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                          Wallet
                      </button>
                 
              </li>
                    
                </ul>
            </nav>
        </div>
    );
};

export default AdminSidebar;
