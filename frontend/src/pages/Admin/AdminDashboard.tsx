import React, { useState, useEffect } from "react";
import AdminNavbar from "../../pages/Admin/AdminNavbar";
import AdminSidebar from "../../pages/Admin/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import toast from "react-hot-toast";
import UserManagement from "../../components/admin/UserManagement"; 
import WorkerManagement from "../../components/admin/WorkerManagement";
import ServiceManagement from "../../components/admin/ServiceManagement";
import AdminBookings from "../../components/admin/bookings";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('admin_Id')
    const [currentComponent, setCurrentComponent] = useState("dashboard"); 

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
          
        }
    }, [ navigate]);

   
    const renderComponent = () => {
        switch (currentComponent) {
            case "userManagement":
                return <UserManagement />;
            case "workerManagement":
                return <WorkerManagement/>;
            case "serviceManagement" :
                return <ServiceManagement/>   
            case "bookings" :
                return <AdminBookings/>    
            case "dashboard":
                return (
                    <>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="mt-4">Welcome to your admin dashboard!</p>
                    </>
                );
            default:
                return <h1 className="text-2xl font-bold">Component Not Found</h1>;
        }
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Admin Navbar */}
            <AdminNavbar />
    
            {/* Admin Sidebar and Main Content */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <AdminSidebar setCurrentComponent={setCurrentComponent} />
    
                {/* Main Content */}
                <div className="flex-1 p-6 bg-gray-100" style={{ marginLeft: "16rem", marginTop: "4rem" }}>
                    {renderComponent()}
                </div>
            </div>
        </div>
    )
};

export default AdminDashboard;
