
import axiosInstance from "../utils/axiosInstance";
import errorHandler from "../utils/errorHandler";

export const adminLogin = async (credentials: { email: string; password: string }): Promise<any> => {
    console.log("credentials",credentials)
    try {
        const response = await axiosInstance.post('/admin/login', credentials); 
        console.log("response",response)
        
      
        return response;
    } catch (error: any) {
        errorHandler(error);
        throw error;
    }
};

export const fetchUsers = async (page = 1, limit = 10, search = '') => {
    const token = localStorage.getItem('admin_accessToken');
    try {
        const response = await axiosInstance.get('/admin/get-users',{
            params: {
                page,
                limit,
                search,
            },
            headers: {
             
                'Authorization': `Bearer ${token}`, 
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
    const token = localStorage.getItem('admin_accessToken');
    try {
        const response = await axiosInstance.patch(`/admin/users/${userId}/block`,{},{
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log('Block user response:', response.data); 
        return response.data; 
    } catch (error) {
        errorHandler(error);
        throw error;
    }
};


export const unblockUser = async (userId:string) => {
    const token = localStorage.getItem('admin_accessToken');
    try {
        const response = await axiosInstance.patch(`/admin/users/${userId}/unblock` ,{},{
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log('Unblock user response:', response.data); 
        console.log("unblock",response)
        return response.data; 
       
    } catch (error) {
        errorHandler(error);
        throw error;
    }

    
};

export const fetchWorkers = async (page = 1, limit = 10, search = '') => {
    const token = localStorage.getItem('admin_accessToken');
    try{
    const response = await axiosInstance.get('/admin/get-workers',{
        params: {
            page,
            limit,
            search,
        },
        headers: {
             
            'Authorization': `Bearer ${token}`, 
        },
    });
        console.log("respo", response);
        return response.data.workers; 
    } catch (error: any) {
        errorHandler(error);
        throw error;
    }
}

export const blockWorker = async (workerId: string) => {
    const token = localStorage.getItem('admin_accessToken');
    try {
        const response = await axiosInstance.patch(`/admin/workers/${workerId}/block`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log('Block worker response:', response.data);
        return response.data;
    } catch (error) {
        errorHandler(error);
        throw error;
    }
}

export const unblockWorker = async (workerId: string) => {
    const token = localStorage.getItem('admin_accessToken');
    try {
        const response = await axiosInstance.patch(`/admin/workers/${workerId}/unblock`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log('Unblock worker response:', response.data);
        return response.data;
    } catch (error) {
        errorHandler(error);
        throw error;
    }
}


export const fetchServices = async (page = 1, limit = 5, search = '') => {
    const token = localStorage.getItem('admin_accessToken');
    try {
      const response = await axiosInstance.get('/admin/services', {
        params: {
          page,
          limit,
          search,
        },
        headers: {
             
            'Authorization': `Bearer ${token}`, 
        },
      });
  
      // Return both services and totalServices
      const { services, totalServices } = response.data;
      return { services, totalServices };
    } catch (error:any) {
      throw new Error('Failed to fetch services: ' + error.message);
    }
  };

  


  export const createService = async (formData:FormData) => {
    const token = localStorage.getItem('admin_accessToken');
    const response = await axiosInstance.post('/admin/services', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
             'Authorization': `Bearer ${token}`,
        }
  });
    return response.data;
};

export const updateService = async (serviceId: string, formData:FormData) => {
    const token = localStorage.getItem('admin_accessToken');
    const response = await axiosInstance.put(`/admin/service/edit/${serviceId}`, formData,{
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
        } 
    });
    return response.data;
};
  
 
  export const deleteService = async (serviceId:string) => {
    const token = localStorage.getItem('admin_accessToken');
    try {
      const response = await axiosInstance.delete(`/admin/service/delete/${serviceId}`,{
        headers: {
             
            'Authorization': `Bearer ${token}`, 
        },
      });
      return response.data; 
    } catch (error) {
        errorHandler(error);
        throw error;
    }
  };

  export const fetchAllBookings = async (page = 1, limit = 10, search = '') => {
    const token = localStorage.getItem('admin_accessToken');
    try {
        const response = await axiosInstance.get('/admin/bookings', {
            params: {
                page,
                limit,
                search,
            },
            headers: {
             
                'Authorization': `Bearer ${token}`, 
            },
        });
        return response.data; 
    } catch (error) {
        errorHandler(error);
        throw error;
    }
};

export const revenueForAdmin = async (timeFrame:string) => {
    const token = localStorage.getItem('admin_accessToken');
    try{
        const respo  = await axiosInstance.get(`/admin/revenue?timeFrame=${timeFrame}` ,{
            headers: {
             
                'Authorization': `Bearer ${token}`, 
            }, 
        })
        console.log("admin" , respo)
        return respo.data ;
    }catch (error) {

    }
    
}

export const numberOfBookings = async (timeFrame:string) => {
    const token = localStorage.getItem('admin_accessToken');
    try{
        const respo = await axiosInstance.get(`/admin/bookingCount?timeFrame=${timeFrame}` ,{
            headers: {
             
                'Authorization': `Bearer ${token}`, 
            }, 
        })
        return respo.data;
    }catch (error) {

    }
   
}

export const getPopular = async () => {
    const token = localStorage.getItem('admin_accessToken');
    try{
        const response = await axiosInstance.get('/admin/popularService' ,{
            headers: {
                 
                'Authorization': `Bearer ${token}`, 
            },  
        })
        return response.data
    }catch(error) {

    }
   
}

export const getTopWorkers = async () => {
    const token = localStorage.getItem('admin_accessToken');
    try{
        const response = await axiosInstance.get('/admin/topWorkers' ,{
            headers: {
                     
                'Authorization': `Bearer ${token}`, 
            },  
        })
        return response.data;
    }catch (error) {

    }
    
}


export const getWalletDetails = async () => {
    const token = localStorage.getItem('admin_accessToken');
    try{
    const response = await axiosInstance.get('/admin/wallet' ,{
        headers: {
                     
            'Authorization': `Bearer ${token}`, 
        },  
    })
    return response.data;
    }catch (error) {

    }
}


export const getWorkerProfile = async(workerId:string) => {
    const token = localStorage.getItem('admin_accessToken');
    try{
        const response = await axiosInstance.get(`/admin/workerprofile/${workerId}` ,{
            headers: {
                     
                'Authorization': `Bearer ${token}`, 
            },  
        })
        return response.data;
    
    }catch (error) {
        
}
}