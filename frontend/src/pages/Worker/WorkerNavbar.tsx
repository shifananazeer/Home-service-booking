import React from 'react'
import { useDispatch } from 'react-redux';
import { logout } from '../../features/worker/workerSlice';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const WorkerNavbar = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogout = () => {
        // 1️⃣ Clear Redux state
        dispatch(logout()); 
    
        // 2️⃣ Remove authentication data from localStorage
        localStorage.removeItem('workerData');
        localStorage.removeItem('worker_accessToken'); 
        localStorage.removeItem('worker_refreshToken'); 
        localStorage.removeItem('workerId')
        localStorage.removeItem('email')
    
        // 3️⃣ Clear Axios headers to prevent old token usage
        delete axiosInstance.defaults.headers.common["Authorization"];
    
        // 4️⃣ Reload the page to fully reset authentication state
        window.location.href = "/worker/login"; 
    };
    return (
        <nav className="fixed top-0 left-0 w-full h-16 bg-gray-800 text-white flex justify-between items-center p-2 shadow-md">
            <div className="flex items-center">
            <img 
    src="/logo.png" 
    alt="Logo"
    className="h-10 w-10 md:h-12 md:w-12 lg:h-16 lg:w-16" 
/>


                <span className="text-lg font-bold">Workers Area</span>
            </div>
            <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
            >
                Logout
            </button>
        </nav>
  )
}

export default WorkerNavbar
