import React, { useEffect, useState } from 'react';
import { fetchUsers, unblockUser, blockUser } from '../../services/adminService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../../utils/adminAthendication';
import ManagementTable from './Table';
import { FaUserAlt, FaUserAstronaut, FaUserCircle, FaUserNinja, FaUserSecret } from 'react-icons/fa';

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
    const [limit] = useState<number>(10);
    const navigate = useNavigate()
    useEffect(() => {

        const getUsers = async () => {
            const refreshToken = localStorage.getItem('admin_refreshToken');
            const token = localStorage.getItem('admin_accessToken')
            console.log("ttttt",refreshToken)
            try {
          if(!token){

                 if (refreshToken) {
                    const newAccessToken = await refreshAccessToken();
                        if (!newAccessToken) {
                              console.log('Failed to refresh token, redirecting to login...');
                              navigate('/admin/login');
                                return;
                                  }
                            } else {
                      console.log('No refresh token found, redirecting to login...');
                      navigate('/admin/login');
                        return;
                        }

                      }

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
        setCurrentPage(1); 
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          );
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
    return (
        <div className="p-4">
           <h2 className="text-4xl font-serif font-bold text-center mb-4 flex items-center justify-center blink ">User Management<FaUserAlt className="text-3xl ml-2" /></h2>
           {/* <style >{`
        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .blink {
          animation: blink 1.5s infinite;
        }
            .text-shadow {
    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  }
      `}</style> */}
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
                onClick={() => setSearchQuery('')}
                className="ml-2 py-2 px-3 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none transition duration-150 ease-in-out"
              >
                &times;
              </button>
            )}
          </div>
          <ManagementTable
            items={users}
            columns={[
              { header: 'Name', accessor: 'firstName' },
              { header: 'Email', accessor: 'email' },
            ]}
            onToggleBlock={handleToggleBlock}
            loadingStatus={loadingStatus}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      );
    
}

export default UserManagement;
