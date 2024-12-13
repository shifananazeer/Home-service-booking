import { RootState } from '@reduxjs/toolkit/query';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/store';
import { logout } from '../features/user/userSlice.';

const Navbar = () => {

    const userData = useAppSelector((state) => state.user.userData); // Access user data
    const dispatch = useDispatch();
    const navigate = useNavigate();


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
     navigate('/profile');
   }
const handleSignupWorkerClick = () => {
    navigate('/register-worker')
}


  return (
    <nav className="navbar bg-gray-900 text-white p-4 flex justify-between">
    <div className="navbar-brand text-lg font-bold">YourBrand</div>
    <div className="flex items-center space-x-4">
    <button
                    className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
                    onClick={handleSignupWorkerClick}
                >
                    Sign Up as Worker
                </button>
        {!userData ? (
            <>
                <button
                    className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                    onClick={handleLoginClick}
                >
                    Login
                </button>
                <button
                    className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
                    onClick={handleSignupClick}
                >
                    SignUp
                </button>
            </>
        ) : (
            <>
                <button
                    className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                    onClick={handleProfileClick}
                >
                    Profile
                </button>
                <button
                    className="bg-red-600 px-4 py-2 rounded hover:bg-red-500"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </>
        )}
    </div>
</nav>
  )
}

export default Navbar
