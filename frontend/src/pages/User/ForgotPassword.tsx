import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { sendResetLink } from '../../services/userService';

const ForgotPassword = () => {

const [email , setEmail ] = useState('')
const [submitted, setSubmitted] = useState<boolean>(false);


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        await sendResetLink(email);
        toast.success('Password reset link sent to your mail');
    }catch (error: any) {
        console.error('Error sending reset link:', error);
       
    }
}


  return (
    <div className="forgot-password-container">
            <h2>Forgot Password</h2>
            {!submitted ? (
                <form 
                onSubmit={handleSubmit}> {/* Ensure correct event handler here */}
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Enter your email" 
                        required 
                    />
                    <button type="submit">Send Reset Link</button>
                </form>
            ) : (
                <div className="confirmation-message">
                    <p>A password reset link has been sent to:</p>
                    <p className="font-semibold">{email}</p>
                    <p>Please check your inbox and follow the instructions.</p>
                </div>
            )}
        </div>
  )
}

export default ForgotPassword
