import axiosInstance from "./axiosInstance";
export const isAdminLoggedIn = () => {
    const token = localStorage.getItem('adminToken');
    return token !== null; 
};

export const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        console.warn('No refresh token found');
        return null; 
    }

    try {
        const response = await axiosInstance.post('/auth/refresh-token', {
            refreshToken, 
        });
        const { accessToken } = response.data; 
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        return null; 
    }
};
