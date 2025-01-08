import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WorkerProfileInterface } from '../../interfaces/workerInterface';
import { Address } from '../../interfaces/addressInterface';
import toast from 'react-hot-toast';
import { fetchService, updateCoordinates, updateWorkerProfile } from '../../services/workerService';
import axios from 'axios';

interface ProfileData {
    name: string;
    skills: string[];
    expirience: string;
    profilePic: string | File;
    status: string;
    address: string;
    area: string;
    hourlyRate: number;
    latitude?: number;
    longitude?: number;
}

interface Service {
    id: string;
    name: string;
}

const EditWorkerProfile = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState<boolean>(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { worker, address }: { worker: WorkerProfileInterface; address: Address } = location.state || {};

    const [profileData, setProfileData] = useState<ProfileData>({
        name: worker?.name || '',
        skills: worker?.skills || [],
        expirience: worker?.expirience || '',
        profilePic: worker?.profilePic || '',
        status: worker?.status || 'Unavailable',
        hourlyRate: worker?.hourlyRate || 0,
        address: address?.address || '',
        area: address?.area || '',
        latitude: worker?.latitude || undefined,
        longitude: worker?.longitude || undefined,
    });

    const [profilePicPreview, setProfilePicPreview] = useState<string>(
        worker?.profilePic || '/avathar.jpeg'
    );
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setProfilePicPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
            setProfileData((prev) => ({ ...prev, profilePic: file }));
        }
    };

    useEffect(() => {
        const getServices = async () => {
            try {
                const fetchedServicesResponse = await fetchService();
                console.log('Fetched services:', fetchedServicesResponse);

                if (fetchedServicesResponse.success && Array.isArray(fetchedServicesResponse.services)) {
                    setServices(fetchedServicesResponse.services);
                } else {
                    console.warn('No valid services found:', fetchedServicesResponse);
                    setServices([]);
                }
            } catch (err) {
                console.error('Error fetching services:', err);
                setServices([]);
            } finally {
                setIsLoadingServices(false);
            }
        };
        getServices();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updatedValue = name === 'hourlyRate' ? parseFloat(value) : value; 
        setProfileData((prev) => ({ ...prev, [name]: updatedValue }));

        if (name === 'area') {
            fetchCoordinates(value);
        }
    };

    const fetchCoordinates = async (area: string) => {
        try {
            const response = await axios.get(import.meta.env.VITE_GOOGLE_MAPS_API_URL, {
                params: {
                    address: area,
                    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                },
            });
    
            console.log('API Response:', response.data);

            if (response.data.results && response.data.results.length > 0) {
                const { lat, lng } = response.data.results[0].geometry.location;
                
                setProfileData((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                }));

                updateCoordinatesInDatabase(lat, lng);
            } else {
                console.warn('No results found for the area:', area);
                // toast.error('No results found for the area.');
            }
        } catch (error: any) {
            console.error('Error fetching coordinates:', error);
            const errorMessage = error.response?.data?.error_message || error.message || 'Failed to fetch coordinates.';
            // toast.error(errorMessage);
        }
    };

    const updateCoordinatesInDatabase = async (lat: number, lng: number) => {
        const workerId = localStorage.getItem('workerId');
    
        if (!workerId) {
            toast.error('Worker ID is not available.');
            return;
        }
    
        try {
            const response = await updateCoordinates(lat, lng, workerId);
            console.log('Coordinates updated successfully:', response.data);
            toast.success('Coordinates updated successfully!');
        } catch (error) {
            console.error('Error updating coordinates in the database:', error);
            // toast.error('Failed to update coordinates in the database.');
        }
    };
    
    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skill = e.target.value;
        setProfileData((prev) => {
            const skills = prev.skills.includes(skill)
                ? prev.skills.filter((s) => s !== skill)
                : [...prev.skills, skill];
            return { ...prev, skills };
        });
    };

    const toggleStatus = () => {
        setProfileData((prev) => ({
            ...prev,
            status: prev.status === 'Available' ? 'Unavailable' : 'Available',
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('name', profileData.name);
        formData.append('skills', JSON.stringify(profileData.skills));
        formData.append('expirience', profileData.expirience);
        formData.append('hourlyRate', String(profileData.hourlyRate)); 
        formData.append('address', profileData.address);
        formData.append('area', profileData.area);
        formData.append('status', profileData.status);
        formData.append('latitude', String(profileData.latitude));
        formData.append('longitude', String(profileData.longitude));
        if (profileData.profilePic && typeof profileData.profilePic !== 'string') {
            formData.append('profilePic', profileData.profilePic);
        }

        try {
            const { success, message } = await updateWorkerProfile(formData);
            if (success) {
                toast.success(message);
                navigate('/worker/dashboard');
            } else {
                toast.error(message);
                setMessage(message);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            toast.error(errorMessage);
            setMessage('Error updating profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
      document.querySelector('form')?.classList.add('animate-fadeIn');
    }, []);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl space-y-6 animate-fadeIn"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Edit Profile</h2>
                {message && <div className="mb-4 text-red-500 text-center">{message}</div>}
                <div className="flex flex-col md:flex-row md:space-x-8">
                    <div className="md:w-1/3 flex flex-col items-center mb-6">
                        <img
                            src={profilePicPreview}
                            alt="Profile Preview"
                            className="w-40 h-40 rounded-full border-4 border-blue-200 mb-4 object-cover"
                        />
                        <label htmlFor="profile-pic" className="cursor-pointer bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition">
                            Change Picture
                        </label>
                        <input id="profile-pic" type="file" onChange={handleFileChange} className="hidden" />
                    </div>
                    <div className="md:w-2/3 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={profileData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="expirience" className="block text-sm font-medium text-gray-700">Experience:</label>
                            <input
                                type="text"
                                id="expirience"
                                name="expirience"
                                value={profileData.expirience}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">Hourly Rate:</label>
                            <input
                                type="number"
                                id="hourlyRate"
                                name="hourlyRate"
                                value={profileData.hourlyRate}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                min="0" 
                                step="0.01" 
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address:</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={profileData.address}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700">Area:</label>
                        <input
                            type="text"
                            id="area"
                            name="area"
                            value={profileData.area}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Skills:</label>
                        {isLoadingServices ? (
                            <p className="text-gray-500">Loading services...</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {services.map((service) => (
                                    <div key={service.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={service.name}
                                            id={`skill-${service.id}`}
                                            checked={profileData.skills.includes(service.name)}
                                            onChange={handleSkillsChange}
                                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`skill-${service.id}`} className="text-sm text-gray-700">
                                            {service.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
                        <button
                            type="button"
                            onClick={toggleStatus}
                            className={`w-full border rounded-md p-3 font-medium transition ${
                                profileData.status === 'Available' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                        >
                            {profileData.status}
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-gray-900 text-white rounded-md p-3 font-medium hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
};

export default EditWorkerProfile;

