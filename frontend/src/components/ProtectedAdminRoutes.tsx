import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../app/store';

interface ProtectAdminRouteProps {
    children: React.ReactNode;
}

const ProtectAdminRoute: React.FC<ProtectAdminRouteProps> = ({ children }) => {
    const token = useSelector((state: RootState) => state.admin.token); 
    console.log("Token in ProtectAdminRoute:", token); 
    
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectAdminRoute;
