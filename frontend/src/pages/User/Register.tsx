import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../features/user/userSlice.';
import { registerUser } from '../../services/userService';
import { SignupInterface } from '../../interfaces/userInterface';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { app } from "../../utils/firebaseConfig"; 
import { signInWithPopup } from 'firebase/auth';
import axiosInstance from '../../utils/axiosInstance';
import socket from '../../utils/socket';

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
    password?: string;
    confirmpassword?: string;
}

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
    const [error, setError] = useState<FormErrors>({});

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
        setError({});
    
        try {
           await registerUser({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                mobileNumber: formData.mobileNumber,
                password: formData.password,
                confirmpassword: ''
            });
    
            // Store name and email in localStorage for OTP verification
            localStorage.setItem('userData', JSON.stringify({
                firstName: formData.firstName,
                email: formData.email
            }));
    
            toast.success('Registration successful! Please verify your OTP.');
            navigate('/verify-otp');
    
        } catch (error: any) {
            const validationErrors = error.response?.data?.errors || [];
            const errorMap: { [key: string]: string } = {};
    
            validationErrors.forEach((err: { field: string; message: string }) => {
                errorMap[err.field] = err.message; // Map field names to messages
            });
    
            setError(errorMap);
            toast.error('Signup failed. Please check the errors below.');
        } finally {
            setLoading(false);
        }
    };
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    

    const handleGoogleSignup = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
    
            console.log("User Info:", user);
    
            // Send user data to backend using Axios
            const response = await axiosInstance.post("/auth/google-signup", {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                profilePhoto: user.photoURL
            });
    
            if (response.data.accessToken) {
                const { accessToken, refreshToken ,userId  , userFirstName , userEmail , userRole} = response.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user_Id' , userId)
                console.log("User authenticated successfully");
                const userData = {
                    name:userFirstName,
                    email: userEmail,
                    refreshToken: refreshToken,
                    accessToken: accessToken,
                    role:userRole
                };
                socket.emit('join', userId, 'user');
                toast.success('Login Successful');
                 dispatch(loginSuccess(userData));
                 navigate('/');
            } else {
                console.error("Error:", response.data.message);
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error);
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
                    {error.firstName && <p className="text-red-500 text-sm">{error.firstName}</p>}
                    
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    {error.lastName && <p className="text-red-500 text-sm">{error.lastName}</p>}
                    
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    {error.email && <p className="text-red-500 text-sm">{error.email}</p>}
                    
                    <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="Mobile Number"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    {error.mobileNumber && <p className="text-red-500 text-sm">{error.mobileNumber}</p>}
                    
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    {error.password && <p className="text-red-500 text-sm">{error.password}</p>}
                    
                    <input
                        type="password"
                        name="confirmpassword"
                        value={formData.confirmpassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    {error.confirmpassword && <p className="text-red-500 text-sm">{error.confirmpassword}</p>}
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

                <div className="mt-4">
                    <button 
                        onClick={handleGoogleSignup} 
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out w-full"
                    >
                        Sign up with Google
                    </button>
                </div>

                <p className="text-center mt-4">Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a></p>
            </form>
        </div>
    );
};

export default SignupForm;
