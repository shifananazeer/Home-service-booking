import axiosInstance from "../utils/axiosInstance";
import { SignupInterface } from "../interfaces/userInterface";
import errorHandler from "../utils/errorHandler";


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
        const response = await axiosInstance.post('/auth/verify-otp', {otp , email});
        return response.data;
    }catch(error: any) {
        errorHandler(error);
        throw error;
    }
}

export const resendOtp = async (email: string) : Promise<any> => {
    try{
        const response = await axiosInstance.post('/auth/resend-otp',{email},{
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

export const loginUser = async (credentials: { email: string; password: string }): Promise<any> => {
    try {
        console.log('Login credentials:', credentials); 
        const response = await axiosInstance.post('/auth/login', credentials, {
            headers: {
                'Content-Type': 'application/json', // Ensure Content-Type is set to application/json
            },
        });
        return response.data;
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