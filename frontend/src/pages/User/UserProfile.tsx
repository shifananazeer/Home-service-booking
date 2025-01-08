import React, { useEffect, useState } from 'react';
import { getUserProfile, resetPassword, resetPasswordFromPassword } from '../../services/userService';
import { ProfileSkeleton } from '../../components/ProfileSkelton';
import { useNavigate } from 'react-router-dom';
import { UserProfileInterface } from '../../interfaces/userInterface';
import { Address } from '../../interfaces/addressInterface';
import ChangePasswordModal from './ChangePasswordModel';
import { refreshAccessToken } from '../../utils/auth';

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
    const [isModalOpen, setModalOpen] = useState<boolean>(false);

    const [selectedAction, setSelectedAction] = useState<string | null>(null);

    const handleOpenModal = (action: string) => {
        setSelectedAction(action);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedAction(null);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getUserProfile();
                console.log('Fetched user profile data:', data);

                setUserProfile(data.user);
                setUserAddress(data.address);
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);



    const handlePasswordChange = async (newPassword: string) => {
        try {
          const response = await resetPasswordFromPassword(newPassword)
    
       
          alert('Password updated successfully!');
          handleCloseModal();
        } catch (error) {
          console.error('Failed to update password:', error);
          alert('An unexpected error occurred. Please try again.');
        }
      };

      
    if (loading) {
        return <ProfileSkeleton />;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md"
                    role="alert"
                >
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!userProfile) {
        return <div className="text-center text-gray-600 text-xl mt-10">User not found.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto bg-gray-200 rounded-lg shadow-xl overflow-hidden mt-16">
                <div className="lg:flex">
                    {/* Sidebar */}
                    <div className="lg:w-1/4 bg-gray-200 p-6 border-r border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
                        <nav>
                            <ul className="space-y-2">
                                {[
                                    { text: 'Change Password', onClick: () => handleOpenModal('Change Password') },
                                    { text: 'Booking List', path: '/booking-list' },
                                    { text: 'Messages', path: '/user/messages' },
                                    { text: 'Notifications', path: '/user/notifications' },
                                ].map((item, index) => (
                                    <li key={index}>
                                        <button
                                            onClick={
                                                item.onClick || (() => item.path && navigate(item.path))
                                            }
                                            className="w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-gray-950 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {item.text}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4 p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">User Profile</h1>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() =>
                                        navigate('/user/edit-profile', {
                                            state: { user: userProfile, address: userAddress },
                                        })
                                    }
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Edit Profile
                                </button>
                                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                                    Logout
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-950 shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6 flex items-center space-x-6">
                                <img
                                    src={userProfile.profilePic || '/avathar.jpeg'}
                                    alt="Profile"
                                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                                <div>
                                    <h3 className="text-2xl font-bold text-white">
                                        {userProfile.firstName} {userProfile.lastName}
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-200">{userProfile.email}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-200">Address</dt>
                                        <dd className="mt-1 text-sm text-gray-200">
                                            {userAddress ? (
                                                <>
                                                    <p>{userAddress.address}</p>
                                                    <p className="text-gray-200">{userAddress.area}</p>
                                                </>
                                            ) : (
                                                <p className="text-gray-500 italic">No address available.</p>
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selectedAction === 'Change Password' && (
                <ChangePasswordModal onClose={handleCloseModal}  onSubmit={handlePasswordChange}/>
            )}
        </div>
    );
};

export default UserProfile;
