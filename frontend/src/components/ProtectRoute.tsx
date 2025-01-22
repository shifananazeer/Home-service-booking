import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ requiredRole }: { requiredRole: string }) => {
    const storedUser = localStorage.getItem('userData');
    const user = storedUser ? JSON.parse(storedUser) : null;

    // Check if the user has the required role
    if (!user || user.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
