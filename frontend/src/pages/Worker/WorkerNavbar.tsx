import React from 'react'
import { useDispatch } from 'react-redux';
import { logout } from '../../features/worker/workerSlice';
import { useNavigate } from 'react-router-dom';

const WorkerNavbar = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogout = () => {
        dispatch(logout()); // Clear Redux state and localStorage
        navigate('/worker/login'); // Redirect to the login page
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
  )
}

export default WorkerNavbar
