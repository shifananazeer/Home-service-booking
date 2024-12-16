import React, { useState, useEffect } from "react";
import AdminNavbar from "../../pages/Admin/AdminNavbar";
import AdminSidebar from "../../pages/Admin/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import toast from "react-hot-toast";
import UserManagement from "../../components/admin/UserManagement"; // Import UserManagement

const AdminDashboard = () => {
    const navigate = useNavigate();
    const current = useSelector((state: RootState) => state.admin.token);
    const [currentComponent, setCurrentComponent] = useState("userManagement"); // Set default to userManagement

    useEffect(() => {
        if (!current) {
            navigate('/admin/login');
            toast.error("Please log in to access the admin dashboard.");
        }
    }, [current, navigate]);

    // Function to render the correct component based on the state
    const renderComponent = () => {
        switch (currentComponent) {
            case "userManagement":
                return <UserManagement />;
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
                <div className="flex-1 p-6 bg-gray-100">
                    {renderComponent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
