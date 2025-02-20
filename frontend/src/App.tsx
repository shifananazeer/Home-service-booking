import { useEffect } from "react"
import { BrowserRouter as  Router , Routes, Route, useLocation } from "react-router-dom"
import Register from "./pages/User/Register"
import Login from "./pages/User/Login";
import OTPverification from "./pages/User/OTPverification";
import ForgotPassword from "./pages/User/ForgotPassword";
import ResetPassword from "./pages/User/ResetPassword";
import Navbar from "./components/Navbar";
import WorkerOtp from "./pages/Worker/workerOtp";
import WorkerSignup from "./pages/Worker/WorkerSignup";
import WorkerDashboard from "./pages/Worker/WorkerDashboard";
import WorkerForgotPassword from "./pages/Worker/WorkerForgotPassword";
import WorkerLogin from "./pages/Worker/WorkerLogin";
import WorkerResetPassword from "./pages/Worker/WorkerResetPassword";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserProfile from "./pages/User/UserProfile";
import EditUserProfile from "./pages/User/EditUserProfile";
import WorkerEditProfile from "./pages/Worker/WorkerEditProfile";
import HomePage from "./components/HomePage";
import ServicesPage from "./components/ServicePage";
import BookingPage from "./pages/User/BookingPage";
import BookingConfirm from "./pages/User/BookingConfirm";
import PaymentPage from "./pages/User/PaymentPage";
import BookingList from "./pages/User/bookingList";
import WorkerBookings from "./components/worker/bookings";
import BookingSuccessPage from "./pages/User/Success";
import CancelPage from "./pages/User/Cancel";
import WorkerProfilePage from "./pages/User/WorkerProfileView";
import MessageList from "./pages/User/Messages";
import VideoCallPage from "./pages/User/VideoCall";
import WorkerVideoCallPage from "./pages/Worker/WorkerVedioCall";
import { NotificationProvider } from "./NotificationContext";
import AudioCall from "./pages/User/AudioCall";
import WorkerAudioCall from "./pages/Worker/WorkerAudioCall";
import { NotificationProviderUser } from "./NotificationContextForUser";
import BalancePaymentSuccessPage from "./pages/User/balancePaymentSuccessPage";
import NotificationPage from "./pages/User/NotificationPage";
import { Footer } from "./components/footer";
import ProtectedRoute from "./components/ProtectRoute";
import UnauthorizedPage from "./components/Unotherized";
import ProtectedWorkerRoute from "./components/ProtectWorkerRoute";
import AdminProtectedRoute from "./components/ProtectAdminRoutes";



declare global {
  interface Window {
    initMap?: () => void
  }
}




const App = () => {
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    window.initMap = () => {
      // This function will be called when the Google Maps API is loaded
      // You can initialize any map-related functionality here if needed
    }

    loadGoogleMapsScript()

    return () => {
      // Clean up the global initMap function when the component unmounts
      if (window.initMap) {
        window.initMap = undefined
      }
    }
  }, [])
  return (
   
   <Router>
      <ConditionalNavbar />
      {/* <Toaster position="top-right" reverseOrder={false} />  */}

    <Routes>

         {/* Public Routes */}
      <Route path="/" element={<NotificationProviderUser><HomePage/></NotificationProviderUser>}/>
     
    <Route path="/login" element={<Login />} />
    <Route path="/verify-otp" element={<OTPverification />} />
    <Route path="/forgot-password" element={<ForgotPassword/>}/>
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/register-worker" element={<WorkerSignup />} />
    <Route path="/worker/verify-otp" element= {<WorkerOtp/>}/>
    <Route path="/worker/forgotPassword" element={<WorkerForgotPassword/>}/>
    <Route path="/worker/login" element={<WorkerLogin/>}/>
    <Route path="/worker/reset-password" element= { <WorkerResetPassword/>}/>
    <Route path="/admin/login" element={<AdminLogin/>}/>
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route path="/services" element={<NotificationProviderUser><ServicesPage/></NotificationProviderUser>}/>
    <Route path="/register" element={<Register />} />
     <Route element={<ProtectedRoute requiredRole="user" />}> 
   
     
      <Route path="/book/:serviceId" element={<NotificationProviderUser><BookingPage /></NotificationProviderUser>} />
      <Route path="/payment" element={<PaymentPage/>}/>
      <Route path="/booking-list" element={<NotificationProviderUser><BookingList/></NotificationProviderUser>}/>
    <Route path="/user/profile" element={<UserProfile/>}/>
    <Route path="/user/edit-profile" element={<EditUserProfile />} />
    <Route path="/confirm-booking/:workerId" element={<BookingConfirm/>}/>
    <Route path='/booking-success' element={<BookingSuccessPage/>}/>
    <Route path="/balancePayment-success" element={<BalancePaymentSuccessPage/>}/>
    <Route path='/cancel' element={<CancelPage/>}/>
    <Route path='/view-worker/profile'element={<WorkerProfilePage/>}/>
    <Route path="/user/messages" element={<MessageList/>}/>
    <Route path="/videoCall/:workerId" element={<VideoCallPage/>}/>
    <Route path='/audioCall/:workerId' element={<AudioCall/>}/>
    <Route path="/user/notifications" element={<NotificationPage/>}/>
    </Route>

    <Route element={<ProtectedWorkerRoute requiredRole="worker" />}>
    <Route path="/worker/dashboard" element={<NotificationProvider> <WorkerDashboard /></NotificationProvider>} />
   
    <Route path="/worker/edit-profile" element={<WorkerEditProfile/>}/>
    <Route path="/worker/bookings" element= {<WorkerBookings/>}/>
    <Route path="/worker/videocall"element={<WorkerVideoCallPage/>}/>
    <Route path="/worker/audioCall" element={<WorkerAudioCall/>}/>
    {/* <Route path="/worker/slot" element={<AvailabilityManagement/>}/> */}
    </Route>
    <Route element={<AdminProtectedRoute requiredRole="admin" />}>
   
    <Route path="/admin/dashboard" element={<AdminDashboard />}/>
   
    </Route>     
  </Routes>
   {/* Conditional Footer */}
   <ConditionalFooter />
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
    '/worker/videocall',
    '/worker/audioCall',
    '/unauthorized',
 
    
  ];

  // Check if the current path is in the list of routes to hide the Navbar
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return shouldHideNavbar ? null : <Navbar />;
};


const ConditionalFooter = () => {
  const location = useLocation();

  // Define the routes where the Footer SHOULD NOT appear
  const hideFooterRoutes = [
    '/worker/verify-otp',
    '/register-worker',
    "/worker/dashboard",
    "/worker/login",
    "/worker/reset-password",
    "/worker/forgotPassword",
    "/admin/dashboard",
    "/admin/login",
    '/worker/videocall',
    '/worker/audioCall',
     '/unauthorized',
    '/videoCall/:workerId',
    '/audioCall/:workerId',
    '/user/messages',
    
  ];

  // Check if the current path is in the list of routes to hide the Footer
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return shouldHideFooter ? null : <Footer />;
};