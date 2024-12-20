// utils/axiosInstance.ts

import axios from 'axios';
import { refreshAccessToken } from './auth'; // Adjust the path as necessary

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false; // Track whether a refresh token request is in progress
type PendingRequestCallback = (token: string) => void;
let pendingRequests: PendingRequestCallback[] = []; // Store requests waiting for a new token

const onRefreshed = (token: string) => {
    pendingRequests.forEach((callback) => callback(token)); // Call all pending requests with the new token
    pendingRequests = []; // Clear pending requests
};

const addPendingRequest = (callback: PendingRequestCallback) => {
    pendingRequests.push(callback); // Add request to pending requests
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if the error is a 401 Unauthorized error
        if (error.response && error.response.status === 401) {
            if (!isRefreshing) {
                isRefreshing = true; // Mark that a refresh is in progress

                try {
                    const newAccessToken = await refreshAccessToken();
                    if (newAccessToken) {
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        onRefreshed(newAccessToken); // Notify all pending requests
                        return axios(originalRequest); // Retry original request with new token
                    }
                } catch (refreshError) {
                    console.error('Token refresh error:', refreshError);
                    // Optionally, redirect to login or perform logout action here
                    // e.g., window.location.href = '/login';
                } finally {
                    isRefreshing = false; // Reset the refreshing status
                }
            }

            // If refreshing is in progress, return a promise that resolves when the new token is available
            return new Promise((resolve) => {
                addPendingRequest((token: string) => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    resolve(axios(originalRequest)); // Retry the original request with new token
                });
            });
        }

        return Promise.reject(error); // Reject the promise for other errors
    }
);

export default axiosInstance;
