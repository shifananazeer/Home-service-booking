import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, loginFailure, loginStart } from '../../features/user/userSlice.'; 
import { loginUser } from '../../services/userService';
import socket from '../../utils/socket';

const Login = () => {

    const dispatch = useDispatch(); 
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const token = localStorage.getItem('accessToken')
  

  
   
    useEffect(()=> {
        if(token) {
          
      navigate('/')
        }
    } ,[token , navigate])
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        dispatch(loginStart());
       
        console.log('Dispatching loginStart');
    
        try {
         
            const response = await loginUser({ email, password });
          console.log("ressssssssss",response)
          
            const { accessToken, refreshToken ,userId  , userFirstName , userEmail , userRole} = response;
              console.log("user....." , userId)
              console.log("email" , email)
              console.log("")
          
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user_Id' , userId)
    
           const userData = {
                name:userFirstName,
                email: userEmail,
                refreshToken: refreshToken,
                accessToken: accessToken,
                role:userRole
            };
            
    
            socket.emit('join', userId, 'user');
            console.log('Emitting join event with:', { userId, userType: 'user' });
            
            toast.success('Login Successful');
            console.log('Dispatching loginSuccess:', userData);
             dispatch(loginSuccess(userData));
            navigate('/');
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || 'Login failed';
            toast.error(errorMessage);
            dispatch(loginFailure(errorMessage));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

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
                        Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
