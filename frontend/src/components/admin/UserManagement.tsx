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
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [limit] = useState<number>(10); // Number of users per pa

    useEffect(() => {
        const getUsers = async () => {
            try {
                const userList = await fetchUsers(currentPage, limit, searchQuery);
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
    }, [currentPage, searchQuery, limit]);

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
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1); // Reset to the first page on search
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
            <div className="flex items-center mb-4">
    <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={handleSearch}
        className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-150 ease-in-out"
    />
    {searchQuery && (
        <button
            onClick={() => setSearchQuery('')} // Clears the search input
            className="ml-2 py-2 px-3 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none transition duration-150 ease-in-out"
        >
            &times; {/* Clear button with a cross icon */}
        </button>
    )}
</div>
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
            <div className="mt-4 flex justify-between">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="bg-gray-300 px-4 py-2 rounded"
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="bg-gray-300 px-4 py-2 rounded"
                >
                    Next
                </button>
            </div>
        </div>
    );
    
}

export default UserManagement;
