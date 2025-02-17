import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { loginStart, loginSuccess, loginFail } from '../../features/admin/adminSlice'; 
import { adminLogin } from '../../services/adminService'; 
import { RootState } from '../../app/store'; 


const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state: RootState) => state.admin); 
    const token = localStorage.getItem('admin_Id')
      

    useEffect(() => {
        if (token) {
            navigate('/admin/dashboard');
            // toast.error("Please log in to access the admin dashboard.");
        }
    }, []);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
       
        dispatch(loginStart()); 

        try {
           
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                toast.error('Please enter a valid email address.');
                dispatch(loginFail('Invalid email format'));
                return;
            }

           
            const response = await adminLogin({ email, password });
           
  
            if (response.data) {
                const { accessToken, refreshToken ,adminId , adminEmail , adminRole } = response.data; 
                dispatch(loginSuccess({accessToken ,refreshToken , adminId ,adminEmail ,adminRole})); 
               
                toast.success('Login successful!');
                navigate('/admin/dashboard'); 
            } else {
                toast.error(response.data.message || 'Login failed. Please try again.');
                dispatch(loginFail(response.data.message)); 
            }
        } catch (error: any) {
            console.error('Error during admin login:', error);
            toast.error('Failed to log in. Please try again.');
            dispatch(loginFail('Failed to log in. Please try again.')); 
        }
    };

    return (
        <div className="container mx-auto flex justify-center items-center min-h-screen">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
                {isLoading && <p className="text-center text-gray-500">Loading...</p>} 
                {error && <p className="text-red-500 text-center">{error}</p>} 
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
                        disabled={isLoading} 
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
