
import axios from "axios";
import { SignupWorker } from "../interfaces/workerInterface";
import axiosInstance from "../utils/axiosInstance";
import errorHandler from "../utils/errorHandler";
import { fetchServices } from "./adminService";




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
        
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('workerId',response.data.userId)

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
        console.log("workerId" , workerId)
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
export interface AvailabilitySlot {
    slotId: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }
  
  // Define the interface for the availability with slots
  export interface AvailabilityWithSlots {
   
    date: string; // or Date
    slots: AvailabilitySlot[];
    
  }
  
  // Define the interface for adding availability
  export interface AddAvailability {
    date: string; // Date for which availability is being added
    slots: AvailabilitySlot[]; // Slots for that date
  }
  

export const addAvailability = async (
    availabilityData: AvailabilityWithSlots
): Promise<AddAvailability> => {
    const token = localStorage.getItem('worker_access_token');
    try {
        const response = await axiosInstance.post('/workers/availability', availabilityData, {
            headers : {
                'Authorization':`Bearer ${token}`,
            } 
        });
        

        // Assuming the backend returns the created slot data
        return response.data;
    } catch (error: any) {
        // Log and re-throw for higher-level handling
        console.error('Error adding availability:', error);
        throw error;
    }
};

export const fetchAvailabilitySlots = async(workerId: string, page: number, limit: number)=> {
    const token = localStorage.getItem('worker_access_token');
    const response = await axiosInstance.get(`/workers/availability/${workerId}`,{
        headers : {
            'Authorization':`Bearer ${token}`,
        },
        params: { page, limit }, 
    })
    return response.data
}

export const updateSlotData = async (updateSlot:AvailabilitySlot , slotId : string) => {
    const token = localStorage.getItem('worker_access_token');
    const response = await axiosInstance.put(`/workers/availability/edit/${slotId}`,updateSlot ,{
        headers : {
            'Authorization':`Bearer ${token}`,
        } 
    })
    return response;
}

export const  deleteAvailability  =  async (slotId:string)=> {
    const response = await axiosInstance.delete(`/workers/availability/delete/${slotId}`);
    return response.data; // Assuming your API returns some data
};

export const fetchService = async () => {
const response = await axiosInstance.get('/workers/services');
if (!response) {
    throw new Error('Failed to fetch services');
}
return  response.data; // Ensure this returns an array
}

export const updateCoordinates  = async(lat: number , lng:number, workerId:string) =>{
  const response = await axiosInstance.put('/workers/updateLocation',{
    workerId,
    latitude: lat,
    longitude: lng,
  })  
  return response;
}