import React, { ChangeEvent, useState } from 'react';
import { RootState } from '../../app/store'
import { signupStart, signupSuccess, signupFail } from '../../features/worker/workerSlice';
import { registerWorker } from '../../services/workerService';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SignupWorker } from '../../interfaces/workerInterface';
import toast from 'react-hot-toast';
const WorkerSignup = () => {

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


const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'skills') {
        // Split the skills input into an array
        setFormData({
            ...formData,
            skills: value.split(',').map(skill => skill.trim()), // Split by comma and trim spaces
        });
    } else {
        setFormData({
            ...formData,
            [name]: value
        });
    }
};

const handleSubmit = async (e:React.FormEvent)=> {
    e.preventDefault();
    dispatch(signupStart());
    try {
       const response =  await registerWorker(formData); // Send the whole form data directly
       const token = response.data.token;
        dispatch(signupSuccess(token));
        toast.success('worker Registerd successfully')
        navigate('/worker/verify-otp')
    } catch (error) {
        dispatch(signupFail(error as string));
    }
};


  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-lg">
    <h2 className="text-lg font-bold mb-4">Sign Up as Worker</h2>
    {error && <p className="text-red-500 mb-4">{error}</p>}
    {success && <p className="text-green-500 mb-4">Signup successful! Redirecting...</p>}
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
            <label className="block mb-2" htmlFor="skills">Skills (comma-separated)</label>
            <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills.join(', ')} // Join skills array for input display
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., JavaScript, React, Node.js"
            />
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
            className={`w-full p-2 rounded text-white ${
                isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-500'
            }`}
        >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
    </form>
</div>
  )
}

export default WorkerSignup
