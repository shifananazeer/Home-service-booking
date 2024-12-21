
import axios from "axios";
import { SignupWorker } from "../interfaces/workerInterface";
import axiosInstance from "../utils/axiosInstance";
import errorHandler from "../utils/errorHandler";
import { AvailabilityWithSlots } from "../components/worker/AvailabilityManagement";



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
        
        localStorage.setItem('worker_token', response.data.token);
        console.log("workerToken",response.data.token)
        return response;
    }catch(error: any) {
        errorHandler(error);
        throw error;
    }
}
export const LoginWorker = async (credentials: { email: string; password: string }): Promise<any> => {
    try {
        console.log('Login credentials:', credentials); 
        const response = await axiosInstance.post('/workers/login', credentials, {
            headers: {
                'Content-Type': 'application/json', 
            },
        });
        const { accessToken, refreshToken , workerId } = response.data;
      
        
        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);
        localStorage.setItem('workerId', workerId); 
        
        return response;
    } catch (error: any) {
        errorHandler(error);
        throw error;
    }
}

export const WorkerVerifyOtp = async (otp:string , email:string) : Promise<any> => {
    try{
        const response = await axiosInstance.post('/workers/verify-otp', {otp , email });
        console.log('Verification Success:', response.data);
        localStorage.setItem('worker_access_token', response.data.accessToken);
        localStorage.setItem('worker_refresh_token', response.data.refreshToken);
        return response;
    }catch(error: any) {
        errorHandler(error);
        throw error;
    }
}

export const WorkerResendOtp = async (email: string) : Promise<any> => {
    try{
        const response = await axiosInstance.post('/workers/resend-otp',{email},{
            headers: {
                'Content-Type': 'application/json', 
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


export const getWorkerProfile = async () : Promise <any> => {
    const token = localStorage.getItem('worker_access_token');
    try{
      const response = await axiosInstance.get('/workers/profile',{
        headers : {
            'Authorization':`Bearer ${token}`,
        }
      })
      return response.data
    }catch (error: any) {
        throw new Error(error.response?.data?.message || 'Error fetching user profile');
    }
}

export const  updateWorkerProfile = async (formData : FormData): Promise <{ success: boolean; message: string }> => {
    const token = localStorage.getItem('worker_access_token');
    try{
       const response = await axiosInstance.put('/workers/profile/edit',formData,{
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`, 
        },
       })
       return { success: true, message: 'Profile updated successfully!' };
    }catch (error) {
        errorHandler(error);
        throw error;
    }
}
export interface AddAvailability {
    day: string;
    startTime: string;
    endTime: string;
    slot: string; // Represents the time range, e.g., "9:00-11:00"
    date: string;
}

export const addAvailability = async (
    availabilityData: AvailabilityWithSlots
): Promise<AddAvailability> => {
    try {
        const response = await axiosInstance.post('/workers/availability', availabilityData);

        // Assuming the backend returns the created slot data
        return response.data;
    } catch (error: any) {
        // Log and re-throw for higher-level handling
        console.error('Error adding availability:', error);
        throw error;
    }
};