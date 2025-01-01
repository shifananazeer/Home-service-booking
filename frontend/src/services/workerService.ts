
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
        // localStorage.setItem('workerId', workerId); 
        
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
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
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
    const token = localStorage.getItem('accessToken');
    try{
      const response = await axiosInstance.get('/workers/profile',{
        headers : {
            'Authorization':`Bearer ${token}`,
        }
      })
      console.log("rrrrrrrrr",response.data)
      return response.data

    }catch (error: any) {
        throw new Error(error.response?.data?.message || 'Error fetching user profile');
    }
}

export const  updateWorkerProfile = async (formData : FormData): Promise <{ success: boolean; message: string }> => {
    const token = localStorage.getItem('accessToken');
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
  
  
  export interface AvailabilityWithSlots {
   
    date: string; // or Date
    slots: AvailabilitySlot[];
    
  }
  
 
  export interface AddAvailability {
    date: string; 
    slots: AvailabilitySlot[]; 
  }
  

export const addAvailability = async (
    availabilityData: AvailabilityWithSlots
): Promise<AddAvailability> => {
    const token = localStorage.getItem('accessToken');
    try {
        const response = await axiosInstance.post('/workers/availability', availabilityData, {
            headers : {
                'Authorization':`Bearer ${token}`,
            } 
        });
        return response.data;
    } catch (error: any) {
        console.error('Error adding availability:', error);
        throw error;
    }
};

export const fetchAvailabilitySlots = async(workerId: string, page: number, limit: number)=> {
    const token = localStorage.getItem('accessToken');
    const response = await axiosInstance.get(`/workers/availability/${workerId}`,{
        headers : {
            'Authorization':`Bearer ${token}`,
        },
        params: { page, limit }, 
    })
    return response.data
}

export const updateSlotData = async (updateSlot:AvailabilitySlot , slotId : string) => {
    const token = localStorage.getItem('accessToken');
    const response = await axiosInstance.put(`/workers/availability/edit/${slotId}`,updateSlot ,{
        headers : {
            'Authorization':`Bearer ${token}`,
        } 
    })
    return response;
}

export const  deleteAvailability  =  async (slotId:string)=> {
    const token = localStorage.getItem('accessToken');
    const response = await axiosInstance.delete(`/workers/availability/delete/${slotId}`,{
        headers : {
            'Authorization':`Bearer ${token}`,
        } 
    });
    return response.data; 
};

export const fetchService = async () => {
    const token = localStorage.getItem('accessToken');
const response = await axiosInstance.get('/workers/services',{
    headers : {
        'Authorization':`Bearer ${token}`,
    } 
});
if (!response) {
    throw new Error('Failed to fetch services');
}
return  response.data; 
}

export const updateCoordinates  = async(lat: number , lng:number, workerId:string) =>{
    const token = localStorage.getItem('accessToken');
  const response = await axiosInstance.put('/workers/updateLocation',{
    workerId,
    latitude: lat,
    longitude: lng,
    headers : {
        'Authorization':`Bearer ${token}`,
    } 
  })  
  return response;
}

export const getBookings = async(workerId:string , currentPage:number , limit: number) => {
    const token = localStorage.getItem('accessToken');
    const response = await axiosInstance.get(`/workers/bookings/${workerId}`,{
        params: {
            page: currentPage, 
            limit,

        },
        headers : {
            'Authorization':`Bearer ${token}`,
        } 
    })
    return response ;
}

export const getWorkerLocation = async (workerId :string) => {
    const token = localStorage.getItem('accessToken');
    const response = await axiosInstance.get(`/workers/${workerId}`,{
        headers : {
            'Authorization':`Bearer ${token}`,
        } 
    }); 
    console.log("response.......",response)
    return response.data;
  };

  export const todaysBooking = async (workerId:string) => {
    const token = localStorage.getItem('accessToken');
    const response = await axiosInstance.get(`/workers/today-booking/${workerId}`,{
        headers : {
            'Authorization':`Bearer ${token}`,
        }   
    });
    return response.data
  }