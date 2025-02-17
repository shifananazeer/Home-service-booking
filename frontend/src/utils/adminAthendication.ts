// import axiosInstance from "./axiosInstance";

// export const refreshAccessToken = async (): Promise<string | null> => {
//     const refreshToken = localStorage.getItem('admin_refreshToken');
//     console.log("refresh ....", refreshToken)
//     if (!refreshToken) {
//         console.warn('No refresh token found');
//         return null; 
//     }

//     try {
//         const response = await axiosInstance.post('/admin/refresh-token', {
//             refreshToken, 
//         });
//         const { accessToken } = response.data; 
//         localStorage.setItem('admin_accessToken', accessToken);
//         return accessToken;
//     } catch (error) {
//         console.error('Failed to refresh access token:', error);
//         return null; 
//     }
// };
