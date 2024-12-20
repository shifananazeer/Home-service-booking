import axiosInstance from "./axiosInstance"; // Ensure the correct path

// utils/auth.js
export const isAdminLoggedIn = () => {
    const token = localStorage.getItem('adminToken');
    return token !== null; // Returns true if token exists, false otherwise
};

export const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        console.warn('No refresh token found');
        return null; // Return null if no refresh token is available
    }

    try {
        // Make a request to refresh the access token (adjust endpoint as needed)
        const response = await axiosInstance.post('/auth/refresh-token', {
            refreshToken, // Directly use the variable
        });

        const { accessToken } = response.data; // Assume response contains new access token

        // Store the new access token in localStorage or cookies
        localStorage.setItem('accessToken', accessToken);

        return accessToken; // Return the new access token
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        // Handle specific error cases as necessary (e.g., 401, network issues)
        return null; // Return null if refresh fails
    }
};
