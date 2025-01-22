import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = ({ requiredRole }: { requiredRole: string }) => {
    const storedAdminData = localStorage.getItem('adminData');
    const admin = storedAdminData ? JSON.parse(storedAdminData) : null;

    // Check if the admin is logged in and has the required role
    if (!admin || admin.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;
