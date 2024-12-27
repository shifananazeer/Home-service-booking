import React, { useEffect, useState } from "react"
import { BrowserRouter as  Router , Routes, Route, useLocation } from "react-router-dom"
import Register from "./pages/User/Register"
import Login from "./pages/User/Login";
import { Toaster } from 'react-hot-toast'; 
import OTPverification from "./pages/User/OTPverification";
import ForgotPassword from "./pages/User/ForgotPassword";
import ResetPassword from "./pages/User/ResetPassword";
import Navbar from "./components/Navbar";
import WorkerOtp from "./pages/Worker/workerOtp";
import WorkerSignup from "./pages/Worker/WorkerSignup";
import WorkerDashboard from "./pages/Worker/WorkerDashboard";
import WorkerForgotPassword from "./pages/Worker/WorkerForgotPassword";
import WorkerLogin from "./pages/Worker/WorkerLogin";
import { WorkerResendOtp } from "./services/workerService";
import WorkerResetPassword from "./pages/Worker/WorkerResetPassword";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";

import UserManagement from "./components/admin/UserManagement";
import UserProfile from "./pages/User/UserProfile";
import EditUserProfile from "./pages/User/EditUserProfile";
import WorkerEditProfile from "./pages/Worker/WorkerEditProfile";
import AvailabilityManagement from "./components/worker/AvailabilityManagement";
import HomePage from "./components/HomePage";
import ServicesPage from "./components/ServicePage";
import BookingPage from "./pages/User/BookingPage";
import BookingConfirm from "./pages/User/BookingConfirm";
import PaymentPage from "./pages/User/PaymentPage";
import BookingList from "./pages/User/bookingList";






const App = () => {
  


  return (
   
   <Router>
      <ConditionalNavbar />
    
      {/* <Toaster position="top-right" reverseOrder={false} />  */}
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/services" element={<ServicesPage/>}/>
      <Route path="/book/:serviceId" element={<BookingPage />} />
      <Route path="/payment" element={<PaymentPage/>}/>
      <Route path="/booking-list" element={<BookingList/>}/>
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/verify-otp" element={<OTPverification />} />
    <Route path="/forgot-password" element={<ForgotPassword/>}/>
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/register-worker" element={<WorkerSignup />} />
    <Route path="/user/profile" element={<UserProfile/>}/>
    <Route path="/user/edit-profile" element={<EditUserProfile />} />
    <Route path="/confirm-booking/:workerId" element={<BookingConfirm/>}/>
    {/* Protected Route */}
    <Route
        path="/worker/dashboard"
        element={
           
                <WorkerDashboard />
           
        }
    />
    <Route path="/worker/verify-otp" element= {<WorkerOtp/>}/>
    <Route path="/worker/forgotPassword" element={<WorkerForgotPassword/>}/>
    <Route path="/worker/login" element={<WorkerLogin/>}/>
    <Route path="/worker/reset-password" element= { <WorkerResetPassword/>}/>
    <Route path="/worker/edit-profile" element={<WorkerEditProfile/>}/>
    {/* <Route path="/worker/slot" element={<AvailabilityManagement/>}/> */}
    <Route path="/admin/login" element={ <AdminLogin/>}/>
    <Route
                    path="/admin/dashboard"
                    element={
                      
                            <AdminDashboard />
                       
                    }
                />
              
  </Routes>
   
   </Router>
  )
}

export default App;




const ConditionalNavbar = () => {
  const location = useLocation();

  //  Navbar should NOT appear
  const hideNavbarRoutes = [
    '/worker/verify-otp',
    '/register-worker',
    "/worker/dashboard",
    "/worker/login",
    "/worker/reset-password",
    "/worker/forgotPassword",
    "/admin/dashboard",
    "/admin/login",
    
  ];

  // Check if the current path is in the list of routes to hide the Navbar
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return shouldHideNavbar ? null : <Navbar />;
};