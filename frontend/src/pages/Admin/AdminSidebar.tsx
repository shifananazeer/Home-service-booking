// src/components/AdminSidebar.jsx
import React from "react";


interface AdminSidebarProps {
    setCurrentComponent: (component: string) => void; 
}


const AdminSidebar: React.FC<AdminSidebarProps> = ({ setCurrentComponent }) => {
    return (
        <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-bold">Admin Menu</h2>
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
                             onClick={() => setCurrentComponent("userManagement")}
                            className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                User Management
                            </button>
                       
                    </li>
                    <li>
                       
                            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Worker Management
                            </button>
                       
                    </li>
                    <li>
                        
                            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Booking List
                            </button>
                        
                    </li>
                    <li>
                      
                            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Service Management
                            </button>
                       
                    </li>
                    
                </ul>
            </nav>
        </div>
    );
};

export default AdminSidebar;
