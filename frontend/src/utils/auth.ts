// utils/auth.js
export const isAdminLoggedIn = () => {
    const token = localStorage.getItem('adminToken');
    return token !== null; // Returns true if token exists, false otherwise
};
