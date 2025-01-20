import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import axiosInstance from '../../utils/axiosInstance';
import { getAllNotificationByUserId } from '../../services/userService';

interface Notification {
    _id: string;
    message: string;
    timestamp: string;
}


const NotificationPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const userId = localStorage.getItem('user_Id')

    useEffect(() => {
        const fetchNotifications = async () => {
            if(!userId) {
                return null;
            }
            try {
                const response = await getAllNotificationByUserId(userId) // Fetch notifications
                setNotifications(response.data);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-600 text-lg">Loading notifications...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notifications</h2>
            {notifications.length === 0 ? (
                <p className="text-gray-600">No notifications to display.</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((notification) => (
                        <li
                            key={notification._id}
                            className="p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-50"
                        >
                            <p className="text-gray-800">{notification.message}</p>
                            <small className="text-gray-500">
                                {moment(notification.timestamp).fromNow()}
                            </small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationPage;
