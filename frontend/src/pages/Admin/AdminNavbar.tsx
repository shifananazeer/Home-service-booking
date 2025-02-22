// src/components/AdminNavbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/admin/adminSlice";
import { useDispatch } from "react-redux";


interface AdminNavbarProps {
    toggleSidebar: () => void; // Accepting toggle function as a prop
  }

const AdminNavbar : React.FC<AdminNavbarProps> = ({ toggleSidebar }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const handleLogout = () => {
        dispatch(logout()); 
      localStorage.removeItem('admin_Id')
      localStorage.removeItem('admin_refreshToken')
      localStorage.removeItem('admin_accessToken')
               navigate('/admin/login');
        console.log("Logging out...");
    };

    return (
        <nav className="fixed top-0 left-0 w-full h-16 bg-gray-800 text-white flex justify-between items-center px-4 shadow-md z-50">
            {/* Sidebar Toggle Button */}
      <button onClick={toggleSidebar} className="md:hidden text-white text-2xl">
        ☰
      </button>
        <div className="flex items-center">
            <img
                src="/logo.png"
                alt="Logo"
                className="h-10 w-10 md:h-12 md:w-12 lg:h-16 lg:w-16"
            />
            <span className="ml-4 text-lg font-bold">Admin Panel</span>
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
