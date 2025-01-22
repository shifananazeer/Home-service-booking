import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedWorkerRoute = ({ requiredRole }: { requiredRole: string }) => {
    const storedWorkerData = localStorage.getItem('workerData');
    const worker = storedWorkerData ? JSON.parse(storedWorkerData) : null;

    // Check if the worker is logged in and has the required role
    if (!worker || worker.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedWorkerRoute;
