import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { blockWorker, fetchWorkers, unblockWorker } from "../../services/adminService";




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

    useEffect(()=> {
       const getWorkers = async () => {
                  try {
                      const userList = await fetchWorkers();
                      console.log("API Response:", userList);
                      setWorkers(userList);
                  } catch (err) {
                      console.error("Error fetching users:", err);
                      setError('Failed to fetch users. Please try again later.');
                  } finally {
                      setLoading(false);
                  }
              };
      
              getWorkers();  
    },[])


    const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
        try {
            setLoadingStatus((prev) => ({ ...prev, [userId]: true })); 
            let response;

            
            if (isBlocked) {
                response = await unblockWorker(userId);
                toast.success(`User ${response.user.name} has been unblocked.`);
            } else {
                response = await blockWorker(userId);
                toast.success(`User ${response.user.name} has been blocked.`);
            }

            
            setWorkers((prevUsers) =>
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

    if (Loading) {
        return <div className="flex justify-center items-center h-64"><p>Loading users...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-64"><p className="text-red-500">{error}</p></div>;
    }
   return (
    <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Worker Management</h2>
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
        </div>
  )
}

export default WorkerManagement
