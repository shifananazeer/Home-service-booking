import axios from 'axios'
import { refreshAccessToken } from './auth';

const axiosInstance = axios.create({
    baseURL:'http://localhost:3000/api',
    headers:{
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        
        if (error.response && error.response.status === 401) {
            try {
                const newAccessToken = await refreshAccessToken();

                if (newAccessToken) {
                   
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axios(originalRequest); 
                } else {
                   
                    console.error('Could not refresh token');
                }
            } catch (refreshError) {
                console.error('Token refresh error:', refreshError);
               
            }
        }

        return Promise.reject(error); 
    }
);


export default axiosInstance;