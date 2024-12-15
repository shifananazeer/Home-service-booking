// src/components/AdminNavbar.jsx
import React from "react";
import { Link } from "react-router-dom";

const AdminNavbar = () => {
    const handleLogout = () => {
        // Implement logout logic (e.g., clear token, redirect to login page)
        console.log("Logging out...");
    };

    return (
        <nav className="bg-gray-800 text-white flex justify-between items-center p-4 shadow-md">
            <div className="flex items-center">
                <img
                    src="/path/to/logo.png" // Replace with your logo path
                    alt="Logo"
                    className="h-8 w-8 mr-2" // Adjust logo size as needed
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
