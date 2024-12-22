import axiosInstance from "../utils/axiosInstance";
import errorHandler from "../utils/errorHandler";

export const adminLogin = async (credentials: { email: string; password: string }): Promise<any> => {
    console.log("credentials",credentials)
    try {
        const response = await axiosInstance.post('/admin/login', credentials); 
        console.log("response",response)
        const token = response.data.token; 
        console.log("tokent",token)
        
        
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
        return response.data.users; 
    } catch (error: any) {
        errorHandler(error);
        throw error;
    }
};

export const blockUser = async (userId:string) => {
    try {
        const response = await axiosInstance.patch(`/admin/users/${userId}/block`);
        console.log('Block user response:', response.data); 
        return response.data; 
    } catch (error) {
        console.error('Error blocking user:', error);
        throw error; 
    }
};


export const unblockUser = async (userId:string) => {
    try {
        const response = await axiosInstance.patch(`/admin/users/${userId}/unblock`);
        console.log('Unblock user response:', response.data); 
        console.log("unblock",response)
        return response.data; 
       
    } catch (error) {
        console.error('Error unblocking user:', error);
        throw error; 
    }

    
};

export const fetchWorkers = async () => {
    try{
    const response = await axiosInstance.get('admin/get-workers');
        console.log("respo", response);
        return response.data.workers; 
    } catch (error: any) {
        errorHandler(error);
        throw error;
    }
}

export const blockWorker = async (workerId:string) => {
    try {
        const response = await axiosInstance.patch(`/admin/workers/${workerId}/block`);
        console.log('Block worker response:', response.data); 
        return response.data; 
    } catch (error) {
        console.error('Error blocking worker:', error);
        throw error; 
    } 
}
export const unblockWorker = async (workerId:string) => {
    try {
        const response = await axiosInstance.patch(`/admin/users/${workerId}/unblock`);
        console.log('Unblock worker response:', response.data); 
        console.log("unblock",response)
        return response.data; 
       
    } catch (error) {
        console.error('Error unblocking worker:', error);
        throw error; 
    } 
}