import axiosInstance from "./axiosInstance";
// export const isAdminLoggedIn = () => {
//     const token = localStorage.getItem('adminToken');
//     return token !== null; 
// };

export const refreshAccessToken = async (refreshToken: string, endpoint: string): Promise<string | null> => {
    if (!refreshToken) {
        console.warn('No refresh token found');
        return null; 
    }

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
