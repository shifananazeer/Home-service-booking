import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../services/userService';

const Login = () => {
    const navigate = useNavigate()
    const [email , setEmail] = useState<string>('');
    const [password , setPassword] = useState<string>('')
    const [isLoading , setIsLoading] = useState<boolean>(false)


    const handleSubmit = async (e: React.FormEvent)  => {
      e.preventDefault();
      setIsLoading(true)

      try {
      const  response = await loginUser ({ email , password});
      toast.success('Login Successfull');
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/')
      }catch(error:any){
        console.error('Login error:', error);
        toast.error('Login failed: ' + (error.response?.data?.message || 'Please try again'));
    } finally {
        setIsLoading(false);
    }
    }


    const handleForgotPassword = () => {
        navigate('/forgot-password')
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
                className="p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
                type="submit"
                disabled={isLoading}
                className={`bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
        </form>
        <button onClick={handleForgotPassword} className="forgot-password">
                Forgot Password?
            </button>
        <div className="mt-4 text-center">
            <p className="text-gray-600">
                Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
            </p>
        </div>
    </div>
</div>
  )
}

export default Login
