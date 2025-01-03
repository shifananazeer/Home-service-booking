import axiosInstance from "../utils/axiosInstance";
import { SignupInterface, UserProfileInterface } from "../interfaces/userInterface";
import errorHandler from "../utils/errorHandler";
import axios from "axios";
import { Address } from "../interfaces/addressInterface";
import { Booking } from "../interfaces/bookingInterface";



export const registerUser = async (userDetails : SignupInterface) => {
    try{
        const response = await axiosInstance.post('/auth/register', userDetails);
        console.log(response, "res")
        return response.data;
    } catch (error) {
        errorHandler(error);
        throw error;
    }
}

export const verifyOtp = async (otp:string , email:string) : Promise<any> => {
    try{
        const response = await axiosInstance.post('/auth/verify-otp', {otp , email });
        console.log('Verification Success:', response.data);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user_Id',response.data.userId)
        return response;
    }catch(error: any) {
        errorHandler(error);
        throw error;
    }
}

export const resendOtp = async (email: string) : Promise<any> => {
    try{
        const response = await axiosInstance.post('/auth/resend-otp',{email},{
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

export const loginUser = async (credentials: { email: string; password: string }): Promise<any> => {
    try {
        console.log('Login credentials:', credentials); 
        const response = await axiosInstance.post('/auth/login', credentials, {
            headers: {
                'Content-Type': 'application/json', 
            },
        });
        console.log('Login Response:', response.data);
        const { accessToken, refreshToken, name, email  , userId} = response.data;

        return { accessToken, refreshToken, name, email  , userId}; 
    } catch (error: any) {
        errorHandler(error);
        throw error;
    }
};

export const sendResetLink = async (email: string): Promise<any> => {
    try {
        const response = await axiosInstance.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error: any) {
        errorHandler(error);
        throw error;
    }
};

export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
    try {
        const response = await axiosInstance.post('/auth/reset-password', { token, newPassword });
        return response.data.message;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to reset password.');
    }
};



export const getUserProfile = async () : Promise<any> => {
    const token = localStorage.getItem('accessToken');
    try {
        const response = await axiosInstance.get('/auth/profile',{
            headers: {
             
                'Authorization': `Bearer ${token}`, 
            },

        }); 
        console.log("response" , response)
        return response.data 
    } catch (error:any) {
        throw new Error(error.response?.data?.message || 'Error fetching user profile');
    }
}


export const updateUserProfile = async (formData : FormData) : Promise <{ success: boolean; message: string }> => {
    const token = localStorage.getItem('accessToken');
    console.log("token", token)
try{
   const response = await axiosInstance.put('/auth/profile/edit',formData,{
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

export const fetchAddress = async (userId: string): Promise<Address> => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axiosInstance.get(`/auth/address/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("Backend response:", response.data); 
      return response.data.userAddress;
    } catch (error) {
      errorHandler(error);
      throw error;  
    }
  };
  

  export const fetchWorkersByService = async (serviceName: string) => {
    const token = localStorage.getItem('accessToken'); // Use the token for authorization
    try {
      const response = await axiosInstance.get(`/auth/workers?skill=${encodeURIComponent(serviceName)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log("fetched workers" , response.data.workers)
      return response.data.workers; 
      // Adjust based on your API response structure
    } catch (error) {
      throw new Error('Failed to fetch workers');
    }
  };


  export const fetchingSlots =async (date:Date , workerId:string) => {
    const token = localStorage.getItem('accessToken');
    const formattedDate = date.toISOString().split('T')[0]; 
    try{
        const response = await axiosInstance.get(`/auth/available-slots?workerId=${workerId}&date=${formattedDate}`,{
          headers: {
            'Authorization': `Bearer ${token}`,
          }, 
        });
       
      
     console.log("fetched workers" , response)
      return response
    }catch (error) {
        throw new Error('Failed to fetch slots');
    }
  }



export const createBooking = async(bookingDetails:Booking) => {
    const token = localStorage.getItem('accessToken');

    const response = await axiosInstance.post('/auth/create-booking', bookingDetails , {
        headers: {
            'Authorization': `Bearer ${token}`,
          }, 
    });
    return response;
}
export const fetchBookigs = async (userId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication token is missing');
    }
  
    const response = await axiosInstance.get(`/auth/booking/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Send the token in headers
      },
    });
    return response.data; // Ensure only the data is returned
  };

  export const fetchWorkerById = async (workerId:string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication token is missing');
    }
    const response = await axiosInstance.get(`/auth/worker/${workerId}`,{
        headers: {
            Authorization: `Bearer ${token}`, // Send the token in headers
          },
    })
    return response.data;
  }

  export const cancelBooking = async(bookingId:string) => {
    const token = localStorage.getItem('accessToken');
    console.log("bookid",bookingId)
    if(!token) {
      throw new Error('Authentication token is missing');
    }
    const response = await axiosInstance.post(`/auth/cancelBooking/${bookingId}`)
    return response.data;
  }

  export const fetchServices = async (page = 1, limit = 5, search = '') => {
  
    try {
      const response = await axiosInstance.get('/auth/services', {
        params: {
          page,
          limit,
          search,
        },
       
      });
  
      // Return both services and totalServices
      const { services, totalServices } = response.data;
      return { services, totalServices };
    } catch (error:any) {
      throw new Error('Failed to fetch services: ' + error.message);
    }
  };