import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WorkerProfileInterface } from '../../interfaces/workerInterface';
import { Address } from '../../interfaces/addressInterface';
import toast from 'react-hot-toast';
import { updateWorkerProfile } from '../../services/workerService';

interface ProfileData {
    name: string;
    skills: string[]; // Array of skills
    expirience: string; // Corrected spelling from 'expirience'
    profilePic: string | File;
    status: string;
    address: string;
    area: string;
}

const EditWorkerProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { worker, address }: { worker: WorkerProfileInterface; address: Address } = location.state || {};

    const [profileData, setProfileData] = useState<ProfileData>({
        name: worker?.name || '',
        skills: worker?.skills || [], // Initialize skills as an array
        expirience: worker?.expirience || '', // Corrected property name
        profilePic: worker?.profilePic || '',
        status: worker?.status || 'Unavailable',
        address: address?.address || '',
        area: address?.area || '',
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill); // Filter out empty skills
        setProfileData((prev) => ({
            ...prev,
            skills: skillsArray, 
        }));
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
        formData.append('skills', JSON.stringify(profileData.skills)); // Convert skills array to JSON
        formData.append('expirience', profileData.expirience); // Use corrected property name
        formData.append('address', profileData.address);
        formData.append('area', profileData.area);
        formData.append('status', profileData.status);
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
                <div>
                    <label htmlFor="skills" className="block text-sm font-medium">Skills (comma-separated):</label>
                    <input
                        type="text"
                        id="skills"
                        name="skills"
                        value={profileData.skills.join(', ')} // Convert array to comma-separated string for input
                        onChange={handleSkillsChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="expirience" className="block text-sm font-medium">Experience:</label>
                    <input
                        type="text"
                        id="expirience"
                        name="exprience"
                        value={profileData.expirience}
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
                <div className="flex items-center mt-4">
                    <span>Status: </span>
                    <button
                        type="button"
                        onClick={toggleStatus}
                        className={`ml-2 px-4 py-2 rounded-md text-white ${
                            profileData.status === 'Available' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                    >
                        {profileData.status}
                    </button>
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

export default EditWorkerProfile;
