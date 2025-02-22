import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkerVerifyOtp , WorkerResendOtp  } from '../../services/workerService';
import { otpVerifySuccess } from '../../features/worker/workerSlice';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';


const WorkerOtp = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const [otp, setOtp] = useState<string>('');
    const [timer, setTimer] = useState<number>(300);
    const [isResending, setIsResending] = useState(false);
    const [email, setEmail] = useState<string>(() => {
      const storedEmail = localStorage.getItem('email') || ''; 
      console.log('Retrieved email:', storedEmail); 
      return storedEmail;
  });
    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, []);

    const handleResendOtp = async () => {
        setIsResending(true);
        try {
            await WorkerResendOtp(email);
            setEmail(email)
            console.log("emai;",email)
            toast.success('OTP Resent successfully');
            setTimer(300);
        } catch (error: any) {
            console.log(error.response?.data?.message);
            toast.error('Failed to resend OTP');
        } finally {
            setIsResending(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await WorkerVerifyOtp(otp, email);
            console.log('Response:', response);

            const { accessToken, refreshToken, role, userId } = response.data;
           
            dispatch(otpVerifySuccess({accessToken , refreshToken ,role, userId, }));
            toast.success('OTP Verified Successfully');
            navigate('/worker/dashboard');
        } catch (error: any) {
            console.error('Verification Failed:', error.response?.data?.message);
            toast.error('Verification failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-6 w-96">
                <h2 className="text-xl font-semibold text-center mb-4">Verify OTP</h2>
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        required
                        className="p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-gray-600"
                    />
                    <button
                        type="submit"
                        className="bg-gray-900 text-white py-2 rounded hover:bg-gray-600 transition duration-200"
                    >
                        Verify
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-gray-600">
                        Resend OTP in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </p>
                    <button
                        onClick={handleResendOtp}
                        disabled={timer > 60 || isResending} 
                        className={`mt-2 text-blue-500 hover:underline ${isResending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isResending ? 'Resending...' : 'Resend OTP'}
                    </button>
                </div>
            </div>
        </div>
  )
}

export default WorkerOtp
