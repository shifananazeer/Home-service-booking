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
    const [isGoogleApiLoaded, setGoogleApiLoaded] = useState(false);

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
            const userData = await registerUser({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                mobileNumber: formData.mobileNumber,
                password: formData.password,
                confirmpassword: '',
            });
            dispatch(setUserData(userData));
            toast.success('Registration successful!');
            localStorage.setItem('email', formData.email);
            navigate('/verify-otp');
        } catch (error: any) {
            setError(error.response?.data?.message || 'Registration failed');
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadGoogleAPI = () => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.onload = () => {
                window.gapi.load('auth2', () => {
                    window.gapi.auth2.init({
                        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID!,
                    
                    }).then(() => {
                        console.log('Google API initialized successfully.');
                        setGoogleApiLoaded(true);  // Set the state when loaded
                    }).catch((error: any) => {
                        console.error('Error initializing Google API:', error);
                    });
                });
            };
            document.body.appendChild(script);
        };

        loadGoogleAPI();
    }, []);

    const handleGoogleLogin = async () => {
        try {
            const response = await window.gapi.auth2.getAuthInstance().signIn();
            const token = response.getAuthResponse().id_token;
            const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

            if (!clientId) {
                throw new Error('Google Client ID is not defined');
            }

            const res = await axiosInstance.post('/auth/google', { token });
            console.log('Login successful:', res.data);
            // Dispatch user data or perform further actions
        } catch (error:any) {
            console.error('Google login error:', error.message);
            toast.error('Google login failed.');
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
                        loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                {/* Google Sign-In button */}
                <div className="mt-4">
                    <button 
                        onClick={handleGoogleLogin} 
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out w-full"
                    >
                        Sign in with Google
                    </button>
                </div>
                <p className="text-center mt-4">Or sign up with your email</p>
            </form>
        </div>
    );
};

export default SignupForm;
