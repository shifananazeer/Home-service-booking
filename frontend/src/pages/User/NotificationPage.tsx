import type React from "react";
import { useEffect, useState } from "react";
import moment from "moment";
import { createCheckoutSession, getAllNotificationByUserId, getBalanceAmount, getBooking, markTrue } from "../../services/userService";
import Swal from "sweetalert2";

export interface Notification {
  _id: string;
  message: string;
  timestamp: string;
  bookingId: string;
  booking?: {
    paymentStatus: string;
    totalPayment: number;
    advancePayment: number;
    balancePayment: number;
    workStatus: string;
    serviceName: string;
    bookingId: string;
  } | undefined;
}

export interface Booking {
  workLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  _id: string;
  bookingId: string;
  workerId: string;
  userId: string;
  date: string;
  slotId: string;
  workDescription: string;
  workerName: string;
  serviceImage: string;
  serviceName: string;
  paymentStatus: string;
  workStatus: string;
  advancePayment: number;
  totalPayment: number;
  balancePayment: number;
  createdAt: string;
  __v: number;
}

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = localStorage.getItem("user_Id");

  const fetchNotificationsAndBookings = async () => {
    if (!userId) return;
    try {
      const data = await getAllNotificationByUserId(userId);
      const notificationsWithBookings = await Promise.all(
        data.notifications.map(async (notification: Notification) => {
          if (notification.bookingId) {
            try {
              const bookingData = await getBooking(notification.bookingId);
              return {
                ...notification,
                booking: bookingData.bookings,
              };
            } catch (error) {
              console.error(`Failed to fetch booking for notification ${notification._id}:`, error);
              return notification;
            }
          }
          return notification;
        }),
      );
      setNotifications(notificationsWithBookings);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };


  const markNotificationsAsRead = async () => {
    if(!userId) {
      return
    }
    try {
     await  markTrue(userId)
    } catch (error) {
        console.error('Failed to mark notifications as read:', error);
    }
};

  useEffect(() => {
    fetchNotificationsAndBookings();
    markNotificationsAsRead();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Loading notifications...</p>
      </div>
    );
  }

 
  const sortedNotifications = notifications.sort((a, b) => moment(b.timestamp).unix() - moment(a.timestamp).unix());

  const handleContinuePayment = async (bookingId: any) => {
    console.log(`Continue payment for booking ID: ${bookingId}`);
    try {
      const response = await getBalanceAmount(bookingId);
      const balanceAmount = response?.data;

      if (balanceAmount) {
        const checkoutResponse = await createCheckoutSession({
          amount: balanceAmount * 100,
          bookingId: bookingId,
          paymentType: 'balance',
          successUrl: `http://localhost:5173/balancePayment-success?bookingId=${bookingId}`,
        });

        console.log("Checkout session created:", checkoutResponse);

        if (checkoutResponse.url) {
          window.location.href = checkoutResponse.url;
        } else {
          Swal.fire('Error', 'Failed to create Stripe session', 'error');
        }
      } else {
        console.error("Balance amount is not available for the provided booking ID.");
      }
    } catch (error) {
      console.error("Error in onConfirm function:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notifications</h2>
      {sortedNotifications.length === 0 ? (
        <p className="text-gray-600">No notifications to display.</p>
      ) : (
        <ul className="space-y-4">
          {sortedNotifications.map((notification) => (
            <li key={notification._id} className="p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-50">
              <p className="text-gray-800">{notification.message}</p>
              <small className="text-gray-500">{moment(notification.timestamp).fromNow()}</small>
              {notification.booking ? (
                <>
                  <p className="mt-2">Payment Status: {notification.booking.paymentStatus}</p>
                  <p>Total Payment: ${notification.booking.totalPayment}</p>
                  <p>Advance Payment: ${notification.booking.advancePayment}</p>
                  <p>Balance Payment: ${notification.booking.balancePayment}</p>
                  <p>Work Status: {notification.booking.workStatus}</p>
                  <p>Service: {notification.booking.serviceName}</p>
                  <p>Service: {notification.booking.bookingId}</p>
                  {notification.booking.paymentStatus === "advance_paid" && notification.booking.bookingId && (
                    <button
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => handleContinuePayment(notification.booking?.bookingId)} // Ensure bookingId is defined
                    >
                      Confirm and Continue Payment
                    </button>
                  )}
                </>
              ) : (
                <p className="mt-2">No booking details available</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPage;
