import axiosInstance from "./axiosInstance";

// Common function to refresh access tokens
export const refreshAccessToken = async (refreshToken: string, endpoint: string): Promise<string | null> => {
    if (!refreshToken) {
        console.warn('No refresh token found');
        return null; 
    }
  console.log("refresh", refreshToken)
    try {
        const response = await axiosInstance.post(endpoint, {
            refreshToken, 
        });
        const { accessToken } = response.data; 
        
        // Store token based on the endpoint
        if (endpoint === '/auth/refresh-token') {
            localStorage.setItem('accessToken', accessToken);
        } else if (endpoint === '/workers/refresh-token') {
            localStorage.setItem('worker_accessToken', accessToken);
        } else if (endpoint === '/admin/refresh-token') {
            localStorage.setItem('admin_accessToken', accessToken); // Store admin access token
        }
        
        return accessToken;
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        return null; 
    }
};

// Specific functions using the common refresh function
export const userRefreshAccessToken = (refreshToken: string) => refreshAccessToken(refreshToken, '/auth/refresh-token');
export const workerRefreshAccessToken = (refreshToken: string) => refreshAccessToken(refreshToken, '/workers/refresh-token');
export const adminRefreshAccessToken = (refreshToken: string) => refreshAccessToken(refreshToken, '/admin/refresh-token'); // Admin refresh token function
