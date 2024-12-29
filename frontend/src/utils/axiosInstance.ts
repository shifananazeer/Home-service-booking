

import axios from 'axios';
import { refreshAccessToken } from './auth'; 

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false; 
type PendingRequestCallback = (token: string) => void;
let pendingRequests: PendingRequestCallback[] = []; 

const onRefreshed = (token: string) => {
    pendingRequests.forEach((callback) => callback(token)); 
    pendingRequests = []; 
};

const addPendingRequest = (callback: PendingRequestCallback) => {
    pendingRequests.push(callback); 
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401) {
            if (!isRefreshing) {
                isRefreshing = true; 

                try {
                    const newAccessToken = await refreshAccessToken();
                    if (newAccessToken) {
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        onRefreshed(newAccessToken); 
                        return axios(originalRequest); 
                    }
                } catch (refreshError) {
                    console.error('Token refresh error:', refreshError); 
                } finally {
                    isRefreshing = false; 
                }
            }
          
            return new Promise((resolve) => {
                addPendingRequest((token: string) => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    resolve(axios(originalRequest)); 
                });
            });
        }

        return Promise.reject(error); 
    }
);

export default axiosInstance;
