import React, { useState, useEffect } from 'react';
import { updateUserProfile } from '../../services/userService';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { Address } from '../../interfaces/addressInterface';
import axios from 'axios';
import { updateCoordinates } from '../../services/workerService';

export interface ProfileData {
    firstName: string;
    lastName: string;
    profilePic?: string;
    address: string;
    area: string;
    latitude?: number; // Add latitude
    longitude?: number; // Add longitude
}

const EditUserProfile: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.user as ProfileData;
    const useraddress = location.state?.address as Address;

    const [profileData, setProfileData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        address: useraddress?.address || '',
        area: useraddress?.area || '',
        profilePic: null as File | null,
        profilePicPreview: user.profilePic || '',
        latitude: user?.latitude || undefined, // Initialize latitude
        longitude: user?.longitude || undefined,
    });
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData((prev) => ({
                ...prev,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicPreview: user.profilePic || '',
            }));
        }
    }, [user]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setProfileData((prev) => ({
                ...prev,
                profilePic: file,
                profilePicPreview: URL.createObjectURL(file),
            }));
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Update latitude and longitude when address or area changes
        if (name === 'area') {
            fetchCoordinates(value);
        }
    };

    const fetchCoordinates = async (area: string) => {
        try {
            const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY // Replace with your Geocoding API key
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json`,
                {
                    params: {
                        address:area,
                        key: API_KEY,
                    },
                }
            );

            if (response.data.results && response.data.results.length > 0) {
                const { lat, lng } = response.data.results[0].geometry.location; // Extracting latitude and longitude
                
                // Update profileData state
                setProfileData((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                }));
                updateCoordinatesInDatabase(lat, lng);
            } else {
                console.warn('No results found for the area:', area);
               
            }
        } catch (error) {
            console.error('Error fetching coordinates:', error);
           
            return null;
        }
    };



    const updateCoordinatesInDatabase = async (lat: number, lng: number) => {
        const userId = localStorage.getItem('user_Id');
    
        // Check if workerId exists
        if (!userId) {
            toast.error('Worker ID is not available.');
            return;
        }
    
        try {
            // Assuming updateCoordinates is a function that makes the API call
            const response = await updateCoordinates(lat, lng, userId)
            console.log('Coordinates updated successfully:', response.data);
            toast.success('Coordinates updated successfully!');
        } catch (error) {
            console.error('Error updating coordinates in the database:', error);
            toast.error('Failed to update coordinates in the database.');
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('firstName', profileData.firstName);
        formData.append('lastName', profileData.lastName);
        formData.append('address', profileData.address);
        formData.append('area', profileData.area);
        formData.append('latitude', String(profileData.latitude));
        formData.append('longitude', String(profileData.longitude));
        if (profileData.profilePic) {
            formData.append('profilePic', profileData.profilePic);
        }

        try {
            const { success, message } = await updateUserProfile(formData);
            if (success) {
                toast.success(message);
                navigate('/user/profile');
            } else {
                toast.error(message);
                setMessage(message);
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred.';
            toast.error(errorMessage);
            setMessage('Error updating profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        );
      }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
            >
                <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>
                {message && <div className="mb-4 text-red-500">{message}</div>}
                <div className="flex flex-col items-center mb-4">
                    <img
                        src={profileData.profilePicPreview || '/path/to/default/profile/pic.png'}
                        alt="Profile Preview"
                        className="w-24 h-24 rounded-full border border-gray-300 mb-4"
                    />
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="mb-4"
                    />
                </div>
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium">First Name:</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium">Last Name:</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium">Address:</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={profileData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="area" className="block text-sm font-medium">Area:</label>
                    <input
                        type="text"
                        id="area"
                        name="area"
                        value={profileData.area}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md w-full"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default EditUserProfile;
