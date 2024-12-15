import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { WorkerSendResetLink } from '../../services/workerService';

const WorkerForgotPassword = () => {
    const [email , setEmail ] = useState('')
    const [submitted, setSubmitted] = useState<boolean>(false);
    
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                toast.error('Please enter a valid email address.');
                return;
            }
           console.log("email",email)            
            await WorkerSendResetLink(email);
            toast.success('Password reset link sent to your mail');
            setSubmitted(true); // Update the state
        }catch (error: any) {
            console.error('Error sending reset link:', error);
           
        }
    }
    
    
      return (
        <div className="container mx-auto flex justify-center items-center min-h-screen">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
            {!submitted ? (
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
                    <button
                        type="submit"
                        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md w-full hover:bg-blue-600 transition"
                    >
                        Send Reset Link
                    </button>
                </form>
            ) : (
                <div className="confirmation-message text-center mt-4">
                    <p className="text-gray-700">A password reset link has been sent to:</p>
                    <p className="font-semibold text-blue-600">{email}</p>
                    <p className="text-gray-700">Please check your inbox and follow the instructions.</p>
                </div>
            )}
        </div>
    </div>
  )
}

export default WorkerForgotPassword
