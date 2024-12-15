// src/components/AdminSidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const AdminSidebar = () => {
    return (
        <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-bold">Admin Menu</h2>
            </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    <li>
                        <Link to="/admin/dashboard">
                            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Dashboard
                            </button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/profile-management">
                            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                User Management
                            </button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/messages">
                            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Worker Management
                            </button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/booking-list">
                            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Booking List
                            </button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/todays-work">
                            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md">
                                Service Management
                            </button>
                        </Link>
                    </li>
                    
                </ul>
            </nav>
        </div>
    );
};

export default AdminSidebar;
