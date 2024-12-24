
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

export const fetchUsers = async (page = 1, limit = 10, search = '') => {
    try {
        const response = await axiosInstance.get('/admin/get-users',{
            params: {
                page,
                limit,
                search,
            },
        });
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

export const fetchWorkers = async (page = 1, limit = 10, search = '') => {
    try{
    const response = await axiosInstance.get('/admin/get-workers',{
        params: {
            page,
            limit,
            search,
        },
    });
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
        const response = await axiosInstance.patch(`/admin/workers/${workerId}/unblock`);
        console.log('Unblock worker response:', response.data); 
        console.log("unblock",response)
        return response.data; 
       
    } catch (error) {
        console.error('Error unblocking worker:', error);
        throw error; 
    } 
}

export const fetchServices = async (page = 1, limit = 5, search = '') => {
    console.log("1")
    try {
      const response = await axiosInstance.get('/admin/services',{
        params: {
            page,
            limit,
            search,
        },
      }); // Adjust the URL based on your API endpoint
      return response.data; // Return the fetched data
    } catch (error:any) {
      throw new Error('Failed to fetch services: ' + error.message);
    }
  };

  interface  Service  {
    _id?: string;
    name: string;
    description: string;
    image: string;
};


  export const createService = async (formData:FormData) => {
    const response = await axiosInstance.post('/admin/services', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
  });
    return response.data;
};

// Update an existing service
export const updateService = async (serviceId: string, formData:FormData) => {
    const response = await axiosInstance.put(`/admin/service/edit/${serviceId}`, formData,{
        headers: {
            'Content-Type': 'multipart/form-data',
        } 
    });
    return response.data;
};
  
  // Function to delete a service by its ID
  export const deleteService = async (serviceId:string) => {
    try {
      const response = await axiosInstance.delete(`/admin/service/delete/${serviceId}`);
      return response.data; // Return the response data confirming deletion
    } catch (error) {
      throw error; // Rethrow the error for handling in the calling component
    }
  };