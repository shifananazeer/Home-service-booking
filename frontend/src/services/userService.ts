import axiosInstance from "../utils/axiosInstance";
import { SignupInterface, UserProfileInterface } from "../interfaces/userInterface";
import errorHandler from "../utils/errorHandler";
import axios from "axios";



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
        const { accessToken, refreshToken, name, email } = response.data;

        return { accessToken, refreshToken, name, email }; 
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


