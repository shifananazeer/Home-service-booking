import React from 'react';
import { Navigate } from 'react-router-dom';

const withAuth = (WrappedComponent: React.FC, redirectPath: string, isProtected: boolean) => {
    return (props: any) => {
        const token = localStorage.getItem('admin_token');
        const isLoggedIn = !!token;

        if (isProtected && !isLoggedIn) {
            return <Navigate to={redirectPath} replace />;
        }
        if (!isProtected && isLoggedIn) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        
        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
