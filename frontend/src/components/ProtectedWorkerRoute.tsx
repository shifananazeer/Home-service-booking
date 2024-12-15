import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../app/store';

interface ProtectWorkerRouteProps {
    children: React.ReactNode;
}

const ProtectWorkerRoute: React.FC<ProtectWorkerRouteProps> = ({ children }) => {
    const token = useSelector((state: RootState) => state.worker.token);
    console.log("Token in ProtectWorkerRoute:", token); // Debugging log

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/worker/login" replace />;
    }

    // If token exists, render the child components
    return <>{children}</>;
};

export default ProtectWorkerRoute;
