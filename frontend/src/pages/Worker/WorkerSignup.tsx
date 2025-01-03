import React, { ChangeEvent, useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import { signupStart, signupSuccess, signupFail } from '../../features/worker/workerSlice';
import { fetchService, registerWorker } from '../../services/workerService';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SignupWorker } from '../../interfaces/workerInterface';
import toast from 'react-hot-toast';


interface Service {
    id: string; 
    name: string;
}


const WorkerSignup: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState<boolean>(true);
    const [formData, setFormData] = useState<SignupWorker>({
        name: '',
        email: '',
        phone: '',
        skills: [],
        password: ''
    });

    const { isLoading, error, success } = useSelector((state: RootState) => state.worker);
    const dispatch = useDispatch();
    const navigate = useNavigate();


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

    const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
    
        if (name === 'skills') {
            setFormData((prev) => ({
                ...prev,
                skills: [value], 
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(signupStart());
        try {
            const response = await registerWorker(formData); 
            console.log("dddd",response)
            localStorage.setItem('email', formData.email);
            dispatch(signupSuccess());
            toast.success('Worker registered successfully');
            navigate('/worker/verify-otp');
        } catch (error: any) {
            console.error('Registration error:', error); 
            dispatch(signupFail(error.message || 'Registration failed'));
            toast.error(error); 
        }
    };

    return (
        <div className="items-center max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-lg justify-center">
            <h2 className="text-lg font-bold mb-4">Sign Up as Worker</h2>
            {/* {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">Signup successful! Redirecting...</p>} */}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-2" htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2" htmlFor="phone">Phone</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2" htmlFor="service">Select Service</label>
                    {isLoadingServices ? (
                        <p>Loading services...</p>
                    ) : (
                        <select
                            id="service"
                            name="skills"
                            value={formData.skills.join(',')}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a service</option>
                            {services.map((service) => (
                                <option key={service.id} value={service.name}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block mb-2" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full p-2 rounded text-white ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-500'}`}
                >
                    {isLoading ? 'Signing Up...' : 'Sign Up'}
                </button>
            </form>
            <div className="mt-4 text-center">
                <p className="text-gray-600">
                    Already have an account? <a href="/worker/login" className="text-blue-600 hover:underline">Login</a>
                </p>
            </div>
        </div>
    );
};

export default WorkerSignup;
