import React, { useEffect, useState } from 'react';
import moment from 'moment';
import axiosInstance from '../../utils/axiosInstance';
import { getAllNotificationByUserId, getBooking } from '../../services/userService';

interface Notification {
    _id: string;
    message: string;
    timestamp: string;
    bookingId: string; // Ensure notification has a bookingId field
}

interface Booking {
    id: string;
    status: string;
    balancePaid: boolean;
}

const NotificationPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [bookings, setBookings] = useState<{ [key: string]: Booking }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const userId = localStorage.getItem('user_Id');

    // Fetch notifications and trigger booking fetch
    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            const data = await getAllNotificationByUserId(userId);
            setNotifications(data.notifications);

            // Trigger fetching bookings for notifications with bookingId
            await fetchBookings(data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch bookings by bookingId from notifications
    const fetchBookings = async (notifications: Notification[]) => {
        try {
            // Filter notifications that have a bookingId and create promises to fetch bookings
            const bookingPromises = notifications
                .filter((notification) => notification.bookingId) // Only process notifications with bookingId
                .map((notification) => getBooking(notification.bookingId));
    
            // Await all booking fetch promises
            const bookingResponses = await Promise.all(bookingPromises);
    
            // Map bookings to their bookingId for easier lookup
            const bookingsMap: { [key: string]: Booking } = {};
            bookingResponses.forEach((response) => {
                if (response && response.bookings) {
                    bookingsMap[response.bookings.bookingId] = response.bookings; // Map using bookingId
                } else {
                    console.warn(`No booking found for bookingId: ${response.bookingId}`);
                }
            });
    
            // Update the state with the bookings map
            setBookings(bookingsMap);
            console.log("setboo", bookingsMap); // Log the actual bookingsMap
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }
    };
    

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-600 text-lg">Loading notifications...</p>
            </div>
        );
    }

    const sortedNotifications = notifications.sort((a, b) => 
        moment(b.timestamp).unix() - moment(a.timestamp).unix()
    );

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notifications</h2>
            {sortedNotifications.length === 0 ? (
                <p className="text-gray-600">No notifications to display.</p>
            ) : (
                <ul className="space-y-4">
                    {sortedNotifications.map((notification) => {
                        const booking = bookings[notification.bookingId]; // Fetch booking details for this notification
                        return (
                            <li
                                key={notification._id}
                                className="p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-50"
                            >
                                <p className="text-gray-800">{notification.message}</p>
                                <small className="text-gray-500">
                                    {moment(notification.timestamp).fromNow()}
                                </small>
                                {booking && !booking.balancePaid && (
                                    <button
                                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        onClick={() => handleContinuePayment(booking.id)}
                                    >
                                        Confirm and Continue Payment
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

// Handle "Continue Payment" button click
const handleContinuePayment = (bookingId: string) => {
    console.log(`Continue payment for booking ID: ${bookingId}`);
    // Add logic to redirect to payment or perform the necessary action
};

export default NotificationPage;
