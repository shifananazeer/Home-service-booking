import axios from 'axios';
import { adminRefreshAccessToken, userRefreshAccessToken, workerRefreshAccessToken } from './auth'; 

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, 
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false; 
let pendingRequests: any[] = []; 

const onRefreshed = (token: string) => {
    pendingRequests.forEach((callback) => callback(token));
    pendingRequests = [];
};

const addPendingRequest = (callback: (token: any) => void) => {
    pendingRequests.push(callback);
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            let refreshToken = null;
            let setAccessToken = null;

            if (originalRequest.url.includes('/workers')) {
                refreshToken = localStorage.getItem('worker_refreshToken');
                setAccessToken = workerRefreshAccessToken;
            } else if (originalRequest.url.includes('/admin')) {
                refreshToken = localStorage.getItem('admin_refreshToken');
                setAccessToken = adminRefreshAccessToken;
            } else {
                refreshToken = localStorage.getItem('refreshToken');
                setAccessToken = userRefreshAccessToken;
            }

            if (refreshToken) {
                if (!isRefreshing) {
                    isRefreshing = true;

                    try {
                        const newAccessToken = await setAccessToken(refreshToken);

                        if (newAccessToken) {
                            localStorage.setItem('accessToken', newAccessToken);
                            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                            onRefreshed(newAccessToken);
                            return axios(originalRequest);
                        }
                    } catch (refreshError) {
                        console.error('Token refresh error:', refreshError);
                        pendingRequests = [];
                        localStorage.removeItem('accessToken'); // Clear invalid token
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('worker_refreshToken');
                        localStorage.removeItem('admin_refreshToken');
                        window.location.href = '/login'; // Redirect to login if refresh fails
                    } finally {
                        isRefreshing = false;
                    }
                }

                return new Promise((resolve) => {
                    addPendingRequest((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        resolve(axios(originalRequest));
                    });
                });
            } else {
                console.log('No refresh token found, redirecting to login...');
                window.location.href = '/login'; // Redirect if refresh token is missing
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
