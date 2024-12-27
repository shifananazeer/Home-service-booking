import React, { useEffect, useState } from 'react';
import { getUserProfile } from '../../services/userService';
import { ProfileSkeleton } from '../../components/ProfileSkelton';
import { useNavigate } from 'react-router-dom';
import { UserProfileInterface } from '../../interfaces/userInterface';
import { Address } from '../../interfaces/addressInterface';


export interface UserProfileResponse {
    user: UserProfileInterface; 
    address: Address; 
}

const UserProfile = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState<UserProfileInterface | null>(null);
    const [userAddress, setUserAddress] = useState<Address | null>(null); 
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data: UserProfileResponse = await getUserProfile();
                console.log("Fetched user profile data:", data);
                setUserProfile(data.user); 
                setUserAddress(data.address); 
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return <ProfileSkeleton />;
    }

  
    if (error) {
        return (
          <div className="flex justify-center items-center h-screen">
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          </div>
        );
      }
    if (!userProfile) {
        return <div className="text-center">User not found.</div>;
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="flex flex-col md:flex-row bg-white shadow-md rounded-lg max-w-4xl w-full">
                {/* Sidebar */}
                <div className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => navigate('/user/change-password')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-200 rounded transition"
                            >
                                Change Password
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate('/user/booking-list')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-200 rounded transition"
                            >
                                Booking List
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate('/user/messages')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-200 rounded transition"
                            >
                                Messages
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => navigate('/user/notifications')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-200 rounded transition"
                            >
                                Notifications
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 bg-white shadow-md rounded-lg mx-4">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
                        <img
                            src={userProfile.profilePic || '/avathar.jpeg'}
                            alt="Profile"
                            className="h-24 w-24 object-cover rounded-full border-4 border-gray-300 shadow-md"
                        />
                        <div>
                            <h1 className="text-2xl font-bold">
                                {userProfile.firstName} {userProfile.lastName}
                            </h1>
                            <p className="text-gray-600">{userProfile.email}</p>
                        </div>
                    </div>
                   {/* Display Address */}
                   <div className="mt-4">
                        <h2 className="text-xl font-semibold">Address</h2>
                        {userAddress ? ( 
                            <div className="border-b py-2">
                                <p>{userAddress.address}</p>
                                <p className="text-gray-500">{userAddress.area}</p>
                            </div>
                        ) : (
                            <p className="text-gray-700">No address available.</p>
                        )}
                    </div>
                    <div className="mt-6 flex space-x-4">
                        <button
                            onClick={() => navigate('/user/edit-profile', { state: { user: userProfile , address: userAddress} })}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Edit Profile
                        </button>
                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
