import React, { useEffect, useState } from 'react';
import { fetchUsers, unblockUser, blockUser } from '../../services/adminService';
import toast from 'react-hot-toast';

interface User {
    _id: string;
    firstName: string;
    email: string;
    role: string;
    isBlocked: boolean;
    isVerified: boolean;
}

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingStatus, setLoadingStatus] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const getUsers = async () => {
            try {
                const userList = await fetchUsers();
                console.log("API Response:", userList);
                setUsers(userList);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError('Failed to fetch users. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
        try {
            setLoadingStatus((prev) => ({ ...prev, [userId]: true })); 
            let response;

            
            if (isBlocked) {
                response = await unblockUser(userId);
                toast.success(`User ${response.user.name} has been unblocked.`);
            } else {
                response = await blockUser(userId);
                toast.success(`User ${response.user.name} has been blocked.`);
            }

            
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === response.user._id ? { ...user, isBlocked: response.user.isBlocked } : user
                )
            );
        } catch (error) {
            console.error('Failed to update user status:', error);
            setError('Failed to update user status. Please try again later.');
        } finally {
            setLoadingStatus((prev) => ({ ...prev, [userId]: false })); 
        }
    };
    if (loading) {
        return <div className="flex justify-center items-center h-64"><p>Loading users...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-64"><p className="text-red-500">{error}</p></div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b text-center">Name</th>
                        <th className="py-2 px-4 border-b text-center">Email</th>
                        <th className="py-2 px-4 border-b text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(users) && users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-100 transition-colors duration-200">
                            <td className="py-2 px-4 border-b text-center">{user.firstName}</td>
                            <td className="py-2 px-4 border-b text-center">{user.email}</td>
                            <td className="py-2 px-4 border-b text-center">
                                <button
                                    onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                                    className={`py-1 px-3 rounded ${
                                        user.isBlocked ? 'bg-red-500' : 'bg-green-500'
                                    } text-white`}
                                    disabled={loadingStatus[user._id]}
                                >
                                    {loadingStatus[user._id]
                                        ? 'Loading...'
                                        : user.isBlocked
                                        ? 'Unblock'
                                        : 'Block'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
}

export default UserManagement;
