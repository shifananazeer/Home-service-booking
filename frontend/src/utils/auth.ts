import axiosInstance from "./axiosInstance";

// utils/auth.js
export const isAdminLoggedIn = () => {
    const token = localStorage.getItem('adminToken');
    return token !== null; // Returns true if token exists, false otherwise
};


export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        // Make a request to refresh the access token (adjust endpoint as needed)
        const response = await axiosInstance.post('/auth/refresh-token', {
            // Send the refresh token, typically from localStorage or cookies
            refreshToken: localStorage.getItem('refreshToken'),
        });

        const { accessToken } = response.data; // Assume response contains new access token

        // Optionally store the new access token in localStorage or cookies
        localStorage.setItem('accessToken', accessToken);

        return accessToken; // Return the new access token
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        return null; // Return null if refresh fails
    }
};