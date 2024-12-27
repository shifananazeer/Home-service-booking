import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WorkerProfileInterface } from '../../interfaces/workerInterface';
import { Address } from '../../interfaces/addressInterface';
import toast from 'react-hot-toast';
import { fetchService, updateCoordinates, updateWorkerProfile } from '../../services/workerService';
import axios from 'axios';

interface ProfileData {
    name: string;
    skills: string[]; // Array of skills
    expirience: string; // Corrected spelling from 'expirience'
    profilePic: string | File;
    status: string;
    address: string;
    area: string;
    hourlyRate:number;
    latitude?: number; // Add latitude
    longitude?: number; // Add longitude
}

interface Service {
    id: string; // or number, depending on your API
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
        skills: worker?.skills || [], // Initialize skills as an array
        expirience: worker?.expirience || '', // Corrected property name
        profilePic: worker?.profilePic || '',
        status: worker?.status || 'Unavailable',
        hourlyRate:worker?.hourlyRate||0,
        address: address?.address || '',
        area: address?.area || '',
        latitude: worker?.latitude || undefined, // Initialize latitude
        longitude: worker?.longitude || undefined, // Initialize longitude
    });

    const [profilePicPreview, setProfilePicPreview] = useState<string>(
        worker?.profilePic || '/path/to/default/profile/pic.png'
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
        // Fetch services on component mount
        const getServices = async () => {
            try {
                const fetchedServicesResponse = await fetchService();
                console.log('Fetched services:', fetchedServicesResponse); // Log the fetched response

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

        // If the changed input is 'area', fetch latitude and longitude
        if (name === 'area') {
            fetchCoordinates(value);
        }
    };

    const fetchCoordinates = async (area: string) => {
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                params: {
                    address: area,
                    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Replace with your Google Maps API key
                },
            });
    
            console.log('API Response:', response.data); // Log the full response

        // Check if results exist
        if (response.data.results && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location; // Extracting latitude and longitude
            
            // Update profileData state
            setProfileData((prev) => ({
                ...prev,
                latitude: lat,
                longitude: lng,
            }));

            // Call the function to update latitude and longitude in the database
            updateCoordinatesInDatabase(lat, lng);
        } else {
            console.warn('No results found for the area:', area);
            toast.error('No results found for the area.');
        }
        } catch (error:any) {
            console.error('Error fetching coordinates:', error); // Log the error
            const errorMessage = error.response?.data?.error_message || error.message || 'Failed to fetch coordinates.';
            toast.error(errorMessage); // Show the error message
        }
    };


    const updateCoordinatesInDatabase = async (lat: number, lng: number) => {
        const workerId = localStorage.getItem('workerId');
    
        // Check if workerId exists
        if (!workerId) {
            toast.error('Worker ID is not available.');
            return;
        }
    
        try {
            // Assuming updateCoordinates is a function that makes the API call
            const response = await updateCoordinates(lat, lng, workerId);
            console.log('Coordinates updated successfully:', response.data);
            toast.success('Coordinates updated successfully!');
        } catch (error) {
            console.error('Error updating coordinates in the database:', error);
            toast.error('Failed to update coordinates in the database.');
        }
    };
    

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skill = e.target.value;
        setProfileData((prev) => {
            const skills = prev.skills.includes(skill)
                ? prev.skills.filter((s) => s !== skill) // Remove skill if already selected
                : [...prev.skills, skill]; // Add skill if not selected
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
        formData.append('latitude', String(profileData.latitude)); // Include latitude
        formData.append('longitude', String(profileData.longitude)); // Include longitude
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
                        src={profilePicPreview}
                        alt="Profile Preview"
                        className="w-24 h-24 rounded-full border border-gray-300 mb-4"
                    />
                    <input type="file" onChange={handleFileChange} className="mb-4" />
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>

                {/* Skills Checkbox Section */}
                <div>
                    <label className="block text-sm font-medium">Skills:</label>
                    {isLoadingServices ? (
                        <p>Loading services...</p>
                    ) : (
                        services.map((service) => (
                            <div key={service.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    value={service.name}
                                    id={`skill-${service.id}`}
                                    checked={profileData.skills.includes(service.name)}
                                    onChange={handleSkillsChange}
                                    className="mr-2"
                                />
                                <label htmlFor={`skill-${service.id}`} className="text-sm">
                                    {service.name}
                                </label>
                            </div>
                        ))
                    )}
                </div>

                <div>
                    <label htmlFor="expirience" className="block text-sm font-medium">Experience:</label>
                    <input
                        type="text"
                        id="expirience"
                        name="expirience"
                        value={profileData.expirience}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div>
    <label htmlFor="hourlyRate" className="block text-sm font-medium">Hourly Rate:</label>
    <input
        type="number"
        id="hourlyRate"
        name="hourlyRate"
        value={profileData.hourlyRate}
        onChange={handleChange}
        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        required
        min="0" // Optionally set a minimum value for the hourly rate
        step="0.01" // Allow decimal input
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
                <div>
                    <label className="block text-sm font-medium">Status:</label>
                    <button
                        type="button"
                        onClick={toggleStatus}
                        className={`mt-1 block w-full border rounded-md p-2 ${
                            profileData.status === 'Available' ? 'bg-green-200' : 'bg-red-200'
                        }`}
                    >
                        {profileData.status}
                    </button>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 transition"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
};

export default EditWorkerProfile;
