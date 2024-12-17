import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserData } from '../../features/user/userSlice.';
import { registerUser } from '../../services/userService';
import { SignupInterface } from '../../interfaces/userInterface';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const SignupForm: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<SignupInterface>({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        password: '',
        confirmpassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password !== formData.confirmpassword) {
            toast.error('Passwords do not match!');
            return;
        }
        setLoading(true);
        setError(null);
        try {
          const userData =   await registerUser({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                mobileNumber: formData.mobileNumber,
                password: formData.password,
                confirmpassword: '',
            });
            localStorage.setItem('userData', JSON.stringify(userData));
            toast.success('Registration successful! Please verify your OTP.');
            localStorage.setItem('email', formData.email);
            navigate('/verify-otp');
        } catch (error: any) {
            setError(error.response?.data?.message || 'Registration failed');
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    

    
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign Up</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="Mobile Number"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="password"
                        name="confirmpassword"
                        value={formData.confirmpassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full mt-6 py-2 px-4 rounded text-white font-bold ${
                        loading ? 'bg-gray-300' : 'bg-gray-900 hover:bg-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-gray-500`}
                >
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                {/* Google Sign-In button */}
                {/* <div className="mt-4">
                    <button 
                        onClick={handleGoogleLogin} 
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out w-full"
                    >
                        Sign in with Google
                    </button>
                </div> */}
                <p className="text-center mt-4">Already You have Account? <a href="/login" className="text-blue-600 hover:underline">Login</a> </p>
            </form>
        </div>
    );
};

export default SignupForm;
