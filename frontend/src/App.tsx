import React from "react"
import { BrowserRouter as  Router , Routes, Route } from "react-router-dom"
import Register from "./pages/User/Register"
import Login from "./pages/User/Login";
import { Toaster } from 'react-hot-toast'; 
import OTPverification from "./pages/User/OTPverification";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ForgotPassword from "./pages/User/ForgotPassword";

const clientId="956524607160-vodmtluum57mr6flh23semp00hdenu3g.apps.googleusercontent.com"
const App = () => {
  return (
   
   <Router>
     <GoogleOAuthProvider clientId={clientId}>
      {/* <Toaster position="top-right" reverseOrder={false} />  */}
    <Routes>
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/verify-otp" element={<OTPverification />} />
    <Route path="/forgot-password" element={<ForgotPassword/>}/>
    </Routes>
    </GoogleOAuthProvider>
   </Router>
  )
}

export default App;