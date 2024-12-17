import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../app/store';

interface ProtectWorkerRouteProps {
    children: React.ReactNode;
}

const ProtectWorkerRoute: React.FC<ProtectWorkerRouteProps> = ({ children }) => {
    const token = useSelector((state: RootState) => state.worker.token);
    console.log("Token in ProtectWorkerRoute:", token); 

   
    if (!token) {
        return <Navigate to="/worker/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectWorkerRoute;
