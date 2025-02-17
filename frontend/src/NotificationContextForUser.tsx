import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import NotificationModal from './components/notificationModel'; // Import the modal component
import socket from './utils/socket';
import { getWorkersIds } from './services/userService';
import { useNavigate } from 'react-router-dom';

interface NotificationContextType {
    workerIds: string[];
}
interface NotificationProviderProps {
    children: ReactNode;
}

interface Notification {
    message: string;
    timestamp: string;
    bookingId:string;
}
const NotificationContextUser = createContext<NotificationContextType | undefined>(undefined);
export const NotificationProviderUser: React.FC<NotificationProviderProps> = ({ children }) => {
    const [workerIds, setWorkerIds] = useState<string[]>([]);
    const userId = localStorage.getItem('user_Id') || ''; 
   
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentNotification, setCurrentNotification] = useState<string>(''); 
    const [currentBookingId , setCurrentBookingId] = useState<string>('')
    const navigate = useNavigate()

    const joinNotificationRoom = (workerId: string) => {
        const roomId = `${workerId}-${userId}`;
        socket.emit('notification-join-room', roomId );
        console.log("user join notification room" , roomId)
    };

    const leaveNotificationRoom = (workerId: string) => {
        const roomId = `${workerId}-${userId}`;
        socket.emit('notification-leave-room', roomId);
        console.log("user leave notification room")
    };

    const fetchWorkerIds = async () => {
        try {
            const response = await getWorkersIds(userId);
            const workerIds = response?.data.workerIds; 
            setWorkerIds(workerIds);

            workerIds.forEach((workerId: string) => joinNotificationRoom(workerId));
        } catch (error) {
            console.error('Error fetching worker IDs:', error);
        }
    };

    useEffect(() => {
        fetchWorkerIds();

        socket.on('receive-notification', (notification: Notification) => {
            console.log("receive notification")
            setCurrentNotification(notification.message);
            setCurrentBookingId(notification.bookingId)
            setIsModalOpen(true); 
            console.log('New notification received:', notification);
        });

         // Listen for blockUser event
         socket.on('blockUser', (blockedUserId: string) => {
            if (userId === blockedUserId) {
                // Clear local storage
                localStorage.removeItem('userData');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                // Redirect to unauthorized page
                navigate('/unauthorized', {
                    state: { message: 'You have been blocked by the admin.' },
                });
            }
        });


   
        return () => {
            socket.off('blockUser'),
            workerIds.forEach((workerId: string) => leaveNotificationRoom(workerId));
            socket.disconnect();
        };
    }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <NotificationContextUser.Provider value={{ workerIds }}>
            {children}
            {isModalOpen && (
                <NotificationModal message={currentNotification} onClose={handleCloseModal} bookingId={currentBookingId} />
            )}
        </NotificationContextUser.Provider>
    );
};

export const useNotification = () => {
    return useContext(NotificationContextUser);
};
