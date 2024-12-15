import axiosInstance from "../utils/axiosInstance";

export const adminLogin = async (credentials: { email: string; password: string }): Promise<any> => {
    console.log("credentials",credentials)
    try {
        const response = await axiosInstance.post('/admin/login', credentials); 
        console.log("response",response)
        const token = response.data.token; 
        console.log("tokent",token)
        
        // Save the token to local storage
        localStorage.setItem('admin_token', token);
        return response;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};