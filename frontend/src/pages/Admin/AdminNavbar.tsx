// src/components/AdminNavbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../features/admin/adminSlice";
import { useDispatch } from "react-redux";

const AdminNavbar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const handleLogout = () => {
        dispatch(logout()); 
               navigate('/admin/login');
        console.log("Logging out...");
    };

    return (
        <nav className="bg-gray-800 text-white flex justify-between items-center p-2 shadow-md">
        <div className="flex items-center">
        <img 
src="/logo.png" 
alt="Logo"
className="h-10 w-10 md:h-12 md:w-12 lg:h-16 lg:w-16" 
/>

                <span className="text-lg font-bold">Admin Panel</span>
            </div>
            <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
            >
                Logout
            </button>
        </nav>
    );
};

export default AdminNavbar;
