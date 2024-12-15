import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFail } from '../../features/worker/workerSlice' // Adjust the import path as necessary
import { LoginWorker } from '../../services/workerService'; // Import your API function for logging in
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const WorkerLogin: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const { isLoading, error, success } = useSelector((state: any) => state.worker); // Adjust the state type as necessary

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(loginStart()); // Start loading

        try {
            const response = await LoginWorker({ email, password });
            if (!response || !response.data) {
                throw new Error('Invalid response from server');
            }
            console.log("respo",response)
            const token = response.data.token;
            dispatch(loginSuccess(token));
            toast.success("login successfull")
            navigate('/worker/dashboard')
            // Optionally handle successful login, e.g., redirect or show success message
        } catch (error: any) {
            dispatch(loginFail(error.message)); // Handle login failure
            toast.error("login failed")
        }
    };
    const handleForgotPassword = () => {
        navigate('/worker/forgotPassword');
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-6 w-96">
                <h2 className="text-xl font-semibold text-center mb-4">Login</h2>
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-gray-700"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-gray-700"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`bg-gray-900 text-white py-2 rounded hover:bg-gray-700 transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <button onClick={handleForgotPassword} className="mt-4 text-blue-600 hover:underline">
                    Forgot Password?
                </button>
                <div className="mt-4 text-center">
                    <p className="text-gray-600">
                        Don't have an account? <a href="/workerregister" className="text-blue-600 hover:underline">Register</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WorkerLogin;
