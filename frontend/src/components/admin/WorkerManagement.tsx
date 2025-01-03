import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { blockWorker, fetchWorkers, unblockWorker } from "../../services/adminService";
import { useNavigate } from "react-router-dom";
import { refreshAccessToken } from "../../utils/adminAthendication";




interface Worker {
    _id: string;
    name:string;
    email:string;
    role:string;
    isBlocked:boolean,
    profilePic:string;
    status:string;
    skills:[string];
    expirience: number
}


const WorkerManagement = () => {
    const [workers , setWorkers] = useState<Worker[]>([]);
    const [Loading ,setLoading] = useState<boolean>(true);
    const [error , setError] = useState<string |null>(null);
    const [loadingStatus , setLoadingStatus] = useState<{ [key: string]: boolean }>({});
     const [currentPage, setCurrentPage] = useState<number>(1);
     const [totalPages, setTotalPages] = useState<number>(1);
     const [searchQuery, setSearchQuery] = useState<string>('');
     const [limit] = useState<number>(10); 
     const navigate = useNavigate()

    useEffect(()=> {
       const getWorkers = async () => {
        const refreshToken = localStorage.getItem('admin_refreshToken');
        const token = localStorage.getItem('admin_accessToken')
        console.log("token", token)
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
                    
                      const workerList = await fetchWorkers(currentPage, limit, searchQuery);
                      console.log("API Response:", workerList);
                      setWorkers(workerList);
                  } catch (err) {
                      console.error("Error fetching workers:", err);
                      setError('Failed to fetch workers. Please try again later.');
                  } finally {
                      setLoading(false);
                  }
              };
      
              getWorkers();  
    },[currentPage, searchQuery, limit])


    const handleToggleBlock = async (workerId: string, isBlocked: boolean) => {
        try {
            setLoadingStatus((prev) => ({ ...prev, [workerId]: true })); 
            let response;

            
            if (isBlocked) {
                response = await unblockWorker(workerId);
                toast.success(`Worker ${response.worker.name} has been unblocked.`);
            } else {
                response = await blockWorker(workerId);
                toast.success(`Worker ${response.worker.name} has been blocked.`);
            }

            
            setWorkers((prevWorkers) =>
                prevWorkers.map((worker) =>
                    worker._id === response.worker._id ? { ...worker, isBlocked: response.worker.isBlocked } : worker
                )
            );
        } catch (error) {
            console.error('Failed to update user status:', error);
            setError('Failed to update user status. Please try again later.');
        } finally {
            setLoadingStatus((prev) => ({ ...prev, [workerId]: false })); 
        }
    };
     const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(event.target.value);
            setCurrentPage(1); 
        };
    
        const handlePageChange = (page: number) => {
            setCurrentPage(page);
        };

    if (Loading) {
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
            <h2 className="text-xl font-bold mb-4">Worker Management</h2>
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
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b text-center">Name</th>
                        <th className="py-2 px-4 border-b text-center">Email</th>
                        <th className="py-2 px-4 border-b text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(workers) && workers.map((worker) => (
                        <tr key={worker._id} className="hover:bg-gray-100 transition-colors duration-200">
                            <td className="py-2 px-4 border-b text-center">{worker.name}</td>
                            <td className="py-2 px-4 border-b text-center">{worker.email}</td>
                            <td className="py-2 px-4 border-b text-center">
                                <button
                                    onClick={() => handleToggleBlock(worker._id, worker.isBlocked)}
                                    className={`py-1 px-3 rounded ${
                                        worker.isBlocked ? 'bg-red-500' : 'bg-green-500'
                                    } text-white`}
                                    disabled={loadingStatus[worker._id]}
                                >
                                    {loadingStatus[worker._id]
                                        ? 'Loading...'
                                        : worker.isBlocked
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
  )
}

export default WorkerManagement
