import React from "react"
import { BrowserRouter as  Router , Routes, Route } from "react-router-dom"
import Register from "./pages/User/Register"
import Login from "./pages/User/Login";
import { Toaster } from 'react-hot-toast'; 
import OTPverification from "./pages/User/OTPverification";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ForgotPassword from "./pages/User/ForgotPassword";
import ResetPassword from "./pages/User/ResetPassword";
import Navbar from "./components/Navbar";
import WorkerOtp from "./pages/Worker/workerOtp";
import WorkerSignup from "./pages/Worker/WorkerSignup";
import WorkerDashboard from "./pages/Worker/WorkerDashboard";

const clientId="956524607160-vodmtluum57mr6flh23semp00hdenu3g.apps.googleusercontent.com"
const App = () => {
  return (
   
   <Router>
    <Navbar/>
     <GoogleOAuthProvider clientId={clientId}>
      {/* <Toaster position="top-right" reverseOrder={false} />  */}
    <Routes>
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/verify-otp" element={<OTPverification />} />
    <Route path="/forgot-password" element={<ForgotPassword/>}/>
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/register-worker" element={<WorkerSignup />} />
    <Route path="/worker/dashboard" element={<WorkerDashboard/>}/>
    <Route path="/worker/verify-otp" element= {<WorkerOtp/>}/>
    </Routes>
    </GoogleOAuthProvider>
   </Router>
  )
}

export default App;