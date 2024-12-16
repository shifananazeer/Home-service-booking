import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../app/store'; // Adjust the import path as needed

interface ProtectAdminRouteProps {
    children: React.ReactNode;
}

const ProtectAdminRoute: React.FC<ProtectAdminRouteProps> = ({ children }) => {
    const token = useSelector((state: RootState) => state.admin.token); // Change this to the correct path for your admin token
    console.log("Token in ProtectAdminRoute:", token); 
    // If no token, redirect to admin login
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    // If token exists, render the child components
    return <>{children}</>;
};

export default ProtectAdminRoute;
