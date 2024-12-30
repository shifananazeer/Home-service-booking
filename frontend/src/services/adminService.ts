
import axiosInstance from "../utils/axiosInstance";
import errorHandler from "../utils/errorHandler";

export const adminLogin = async (credentials: { email: string; password: string }): Promise<any> => {
    console.log("credentials",credentials)
    try {
        const response = await axiosInstance.post('/admin/login', credentials); 
        console.log("response",response)
        const refresToken = response.data.refresh_token; 
        const accessToken = response.data.accessToken
        const adminId = response.data.adminId
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken',refresToken)
        localStorage.setItem('admin_Id' , adminId)
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
    try {
      const response = await axiosInstance.get('/admin/services', {
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

export const updateService = async (serviceId: string, formData:FormData) => {
    const response = await axiosInstance.put(`/admin/service/edit/${serviceId}`, formData,{
        headers: {
            'Content-Type': 'multipart/form-data',
        } 
    });
    return response.data;
};
  
 
  export const deleteService = async (serviceId:string) => {
    try {
      const response = await axiosInstance.delete(`/admin/service/delete/${serviceId}`);
      return response.data; 
    } catch (error) {
      throw error; 
    }
  };

  export const fetchAllBookings = async (page = 1, limit = 10, search = '') => {
    try {
        const response = await axiosInstance.get('/admin/bookings', {
            params: {
                page,
                limit,
                search,
            },
        });
        return response.data; // Ensure you're returning the full response data
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error; // Rethrow to handle it in the component
    }
};