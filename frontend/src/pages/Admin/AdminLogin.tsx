// AdminLogin.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminLogin } from '../../services/adminService'

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            // Validate email format
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                toast.error('Please enter a valid email address.');
                return;
            }

            // Call the admin login service
            const response = await adminLogin({ email, password });

            if (response.status === 200) {
                console.log("res",response.data)
                // Navigate to the admin dashboard upon successful login
                navigate('/admin/dashboard'); // Update the route based on your structure
                toast.success('Login successful!');
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Error during admin login:', error);
            toast.error('Failed to log in. Please try again.');
        }
    };

    return (
        <div className="container mx-auto flex justify-center items-center min-h-screen">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="border border-gray-300 rounded-md p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="border border-gray-300 rounded-md p-2 w-full"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md w-full hover:bg-blue-600 transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
