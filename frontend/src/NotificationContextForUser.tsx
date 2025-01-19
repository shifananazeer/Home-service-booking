import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client'; // Assuming you're using socket.io
import axiosInstance from './utils/axiosInstance';
import NotificationModal from './components/notificationModel'; // Import the modal component
import socket from './utils/socket';
import axios from 'axios';
import { getWorkersIds } from './services/userService';

interface NotificationContextType {
    workerIds: string[];
}

// Define the props for the NotificationProvider
interface NotificationProviderProps {
    children: ReactNode;
}

interface Notification {
    message: string;
    timestamp: string;
    bookingId:string;
}

// Define the context
const NotificationContextUser = createContext<NotificationContextType | undefined>(undefined);

// Create a provider component
export const NotificationProviderUser: React.FC<NotificationProviderProps> = ({ children }) => {
    const [workerIds, setWorkerIds] = useState<string[]>([]);
    const userId = localStorage.getItem('user_Id') || ''; // Replace with the actual user ID
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal visibility state
    const [currentNotification, setCurrentNotification] = useState<string>(''); // Current notification message

    // Function to join notification room
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

    // Fetch worker IDs associated with user bookings
    const fetchWorkerIds = async () => {
        try {
            const response = await getWorkersIds(userId);
            const workerIds = response?.data.workerIds; // Adjust according to your API response
            setWorkerIds(workerIds);

            // Join the notification room for each worker ID
            workerIds.forEach((workerId: string) => joinNotificationRoom(workerId));
        } catch (error) {
            console.error('Error fetching worker IDs:', error);
        }
    };

    // Use effect to fetch worker IDs when the component mounts
    useEffect(() => {
        fetchWorkerIds();

        // Listen for notifications from the server
        socket.on('receive-notification', (notification: Notification) => {
            console.log("receive notification")
            setCurrentNotification(notification.message); // Set the current notification message
            setIsModalOpen(true); // Open the modal
            console.log('New notification received:', notification);
        });

        // Cleanup on component unmount
        return () => {
            workerIds.forEach((workerId: string) => leaveNotificationRoom(workerId));
            socket.disconnect();
        };
    }, []);

    // Close the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <NotificationContextUser.Provider value={{ workerIds }}>
            {children}
            {isModalOpen && (
                <NotificationModal message={currentNotification} onClose={handleCloseModal} />
            )}
        </NotificationContextUser.Provider>
    );
};

export const useNotification = () => {
    return useContext(NotificationContextUser);
};
