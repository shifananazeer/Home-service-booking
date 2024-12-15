
import { SignupWorker } from "../interfaces/workerInterface";
import axiosInstance from "../utils/axiosInstance";
import errorHandler from "../utils/errorHandler";



export const registerWorker = async (workerData : SignupWorker) => {
    console.log("workerData",workerData)
    try{
        const response = await axiosInstance.post('/workers/signup', workerData)

        return response.data;
    }catch (error:any){
        throw error.response?.data?.message ||'Error registering worker'
    }
}
export const verifyOtp = async (otp:string , email:string) : Promise<any> => {
    try{
        const response = await axiosInstance.post('/workers/verify-otp', {otp , email });
        console.log("res",response)
        return response.data;
    }catch(error: any) {
        errorHandler(error);
        throw error;
    }
}
export const LoginWorker = async (credentials: { email: string; password: string }): Promise<any> => {
    try {
        console.log('Login credentials:', credentials); 
        const response = await axiosInstance.post('/auth/login', credentials, {
            headers: {
                'Content-Type': 'application/json', // Ensure Content-Type is set to application/json
            },
        });
        localStorage.setItem('worker_token', response.data.token);
        console.log("workerToken",response.data.token)
        return response;
    } catch (error: any) {
        errorHandler(error);
        throw error;
    }
}

export const WorkerVerifyOtp = async (otp:string , email:string) : Promise<any> => {
    try{
        const response = await axiosInstance.post('/workers/verify-otp', {otp , email });
        console.log("res",response)
        return response.data;
    }catch(error: any) {
        errorHandler(error);
        throw error;
    }
}

export const WorkerResendOtp = async (email: string) : Promise<any> => {
    try{
        const response = await axiosInstance.post('/workers/resend-otp',{email},{
            headers: {
                'Content-Type': 'application/json', // Ensure Content-Type is set to application/json
            }
        })
        return response.data;
    }catch(error: any) {
        errorHandler(error);
        throw error;
    }

}

export const WorkerSendResetLink = async (email: string): Promise<any> => {
    try {
        const response = await axiosInstance.post('/workers/forgot-password', { email });
        return response.data;
    } catch (error: any) {
        errorHandler(error);
        throw error;
    }
};

export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
    try {
        const response = await axiosInstance.post('/workers/reset-password', { token, newPassword });
        return response.data.message;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to reset password.');
    }
};