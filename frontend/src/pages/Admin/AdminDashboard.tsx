// src/pages/Admin/AdminDashboard.jsx
import React from "react";
import AdminNavbar from "../../pages/Admin/AdminNavbar"
import AdminSidebar from "../../pages/Admin/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { isAdminLoggedIn } from "../../utils/auth";
import toast from "react-hot-toast";

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    return (
        <div className="flex flex-col h-screen">
            <AdminNavbar />
            <div className="flex flex-1">
                <AdminSidebar />
                <div className="flex-1 p-6 bg-gray-100">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="mt-4">Welcome to your admin dashboard!</p>
                    {/* Add your dashboard content here */}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
