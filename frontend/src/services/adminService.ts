import axiosInstance from "../utils/axiosInstance";
import errorHandler from "../utils/errorHandler";

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
        errorHandler(error);
        throw error;
    }
};

export const fetchUsers = async () => {
    try {
        const response = await axiosInstance.get('admin/get-users');
        console.log("respo", response);
        return response.data.users; // Assuming the data is nested
    } catch (error: any) {
        errorHandler(error);
        throw error;
    }
};

export const blockUser = async (userId:string) => {
    try {
        const response = await axiosInstance.patch(`/admin/users/${userId}/block`);
        console.log('Block user response:', response.data); // Debugging log
        return response.data; // Return the updated user data
    } catch (error) {
        console.error('Error blocking user:', error);
        throw error; // Optionally throw the error to be handled by the caller
    }
};

// Function to unblock a user
export const unblockUser = async (userId:string) => {
    try {
        const response = await axiosInstance.patch(`/admin/users/${userId}/unblock`);
        console.log('Unblock user response:', response.data); // Debugging log
        console.log("unblock",response)
        return response.data; // Return the updated user data
       
    } catch (error) {
        console.error('Error unblocking user:', error);
        throw error; // Optionally throw the error to be handled by the caller
    }

    
};
