

import axios from 'axios';
import { adminRefreshAccessToken, userRefreshAccessToken, workerRefreshAccessToken } from './auth'; 

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

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            const refreshToken = 
                localStorage.getItem('refreshToken') || 
                localStorage.getItem('worker_refreshToken') || 
                localStorage.getItem('admin_refreshToken'); // Retrieve refresh token from storage

            if (refreshToken) {
                if (!isRefreshing) {
                    isRefreshing = true; 

                    try {
                        let newAccessToken: string | null = null;
                        
                        // Determine the request type (user, worker, or admin)
                        if (originalRequest.url.includes('/workers')) {
                            newAccessToken = await workerRefreshAccessToken(refreshToken); 
                        } else if (originalRequest.url.includes('/admin')) {
                            newAccessToken = await adminRefreshAccessToken(refreshToken); 
                        } else {
                            newAccessToken = await userRefreshAccessToken(refreshToken); 
                        }

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
            } else {
                // Handle case where refresh token is missing (e.g., redirect to login)
                console.log('No refresh token found, redirecting to login...');
                // Optionally redirect to login page here
            }
        }

        return Promise.reject(error); 
    }
);

export default axiosInstance;