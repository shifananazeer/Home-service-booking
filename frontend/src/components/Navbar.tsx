import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../app/store'
import { logout } from '../features/user/userSlice.'

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const userData = useAppSelector((state) => state.user.userData)
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
    <nav className="sticky top-0 z-50 w-full bg-black">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-2">
          <img 
              src="/logo.png" 
              alt="ServiceHub Logo"
              style={{ width: '100px', height: '100px' }}
              className="object-contain"
            />
            <span className="text-lg font-bold text-white">ServiceHub</span>
          </a>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
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

        <div className="flex items-center gap-4">
          <button
            onClick={handleSignupWorkerClick}
            className="hidden md:block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
          >
            Register as a Worker
          </button>

          {!userData?.accessToken ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoginClick}
                className="px-4 py-2 text-sm font-medium text-white hover:text-white/80"
              >
                Login
              </button>
              <button
                onClick={handleSignupClick}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500"
              >
                Sign up
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleProfileClick}
                className="px-4 py-2 text-sm font-medium text-white hover:text-white/80"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={toggleMobileMenu}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black">
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
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

