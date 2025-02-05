import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../app/store'
import { logout } from '../features/user/userSlice.'
import { FaSignOutAlt, FaUser, FaUserTie } from 'react-icons/fa'; 
import socket from '../utils/socket'
import axiosInstance from '../utils/axiosInstance'

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const userData = useAppSelector((state) => state.user.userData)
  const token = localStorage.getItem('accessToken')
  const userIds = localStorage.getItem('user_Id')
  const dispatch = useDispatch()
  const navigate = useNavigate()

 

  const handleLoginClick = () => {
    navigate('/login')
   
  }

  const handleSignupClick = () => {
    navigate('/Register')
  }

  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem('userData');
            localStorage.removeItem('user_Id')
              localStorage.removeItem('accessToken')
             localStorage.removeItem('refreshToken')
             localStorage.removeItem('email')

             delete axiosInstance.defaults.headers.common["Authorization"];
    navigate('/')
  }

  const handleProfileClick = () => {
    navigate('/user/profile')
  }

  const handleSignupWorkerClick = () => {
    navigate('/register-worker')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-black ">
      <div className="container mx-auto flex flex-wrap items-center justify-between ">
        {/* Logo and Brand Name */}
        <a href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ServiceHub Logo" style={{ width: '90px', height: '90px' }}  className=" object-contain" />
          <span className="text-lg font-bold text-white sm:inline">ServiceHub</span>
        </a>

        {/* Mobile Menu Button */}
        <button
        className="md:hidden text-white p-2 focus:outline-none"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
    >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
        </svg>
    </button>

        {/* Navigation Links and User Actions (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="/" className="text-sm font-medium text-white hover:text-white/80">
            Home
          </a>
          <a href="/services" className="text-sm font-medium text-white hover:text-white/80">
            Services
          </a>
          <a href="/about" className="text-sm font-medium text-white hover:text-white/80">
            About Us
          </a>
          <a href="/help" className="text-sm font-medium text-white hover:text-white/80">
            Help
          </a>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={handleSignupWorkerClick}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors"
          >
            Register as a Worker
          </button>

          {!token && !userData ? (
            <>
              <button
                onClick={handleLoginClick}
                className="px-4 py-2 text-sm font-medium text-white hover:text-white/80 transition-colors"
              >
                Login
              </button>
              <button
                onClick={handleSignupClick}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleProfileClick}
                className="px-4 py-2 text-sm font-medium text-white hover:text-white/80 transition-colors flex items-center"
              >
                <FaUser className="mr-2" />
                <span>My Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors flex items-center"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden bg-black transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="/" className="block px-3 py-2 text-white hover:text-white/80">
              Home
            </a>
            <a href="/services" className="block px-3 py-2 text-white hover:text-white/80">
              Services
            </a>
            <a href="/about" className="block px-3 py-2 text-white hover:text-white/80">
              About Us
            </a>
            <a href="/help" className="block px-3 py-2 text-white hover:text-white/80">
              Help
            </a>
            <button
              onClick={handleSignupWorkerClick}
              className="block w-full text-left px-3 py-2 text-white hover:text-white/80"
            >
              Register as a Worker
            </button>
            {!token && !userData ? (
              <>
                <button
                  onClick={handleLoginClick}
                  className="block w-full text-left px-3 py-2 text-white hover:text-white/80"
                >
                  Login
                </button>
                <button
                  onClick={handleSignupClick}
                  className="block w-full text-left px-3 py-2 text-white hover:text-white/80"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleProfileClick}
                  className="block w-full text-left px-3 py-2 text-white hover:text-white/80 flex items-center"
                >
                  <FaUser className="mr-2" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-white hover:text-white/80 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

