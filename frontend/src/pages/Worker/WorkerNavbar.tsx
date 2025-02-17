import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../features/worker/workerSlice";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

interface WorkerNavbarProps {
  toggleSidebar: () => void; // Accepting toggle function as a prop
}

const WorkerNavbar: React.FC<WorkerNavbarProps> = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("workerData");
    localStorage.removeItem("worker_accessToken");
    localStorage.removeItem("worker_refreshToken");
    localStorage.removeItem("workerId");
    localStorage.removeItem("email");
    delete axiosInstance.defaults.headers.common["Authorization"];
    window.location.href = "/worker/login";
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-gray-800 text-white flex justify-between items-center px-4 md:px-6 shadow-md z-10">
      {/* Sidebar Toggle Button */}
      <button onClick={toggleSidebar} className="md:hidden text-white text-2xl">
        ☰
      </button>

      {/* Logo */}
      <div className="flex items-center">
        <img src="/logo.png" alt="Logo" className="h-10 w-10 md:h-12 md:w-12 lg:h-16 lg:w-16" />
        <span className="ml-2 text-lg font-bold">Workers Area</span>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
      >
        Logout
      </button>
    </nav>
  );
};

export default WorkerNavbar;
