import type React from "react";
import { useEffect, useState } from "react";
import moment from "moment";
import { createCheckoutSession, getAllNotificationByUserId, getBalanceAmount, getBooking, markTrue } from "../../services/userService";
import Swal from "sweetalert2";
import { Bell } from "lucide-react"


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
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <Bell className="mr-2 h-8 w-8 text-blue-500" />
          Notifications
        </h2>
        <span className="text-sm text-gray-500">{sortedNotifications.length} notifications</span>
      </div>
      {sortedNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-lg text-gray-600">No notifications to display.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sortedNotifications.map((notification) => (
            <li
              key={notification._id}
              className="bg-gray-300 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">{notification.message}</p>
                  <p className="text-sm text-gray-500 mb-4">{moment(notification.timestamp).fromNow()}</p>
                </div>
                {notification.booking && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      notification.booking.paymentStatus === "balance_paid"
                        ? "bg-green-100 text-green-800"
                        : notification.booking.paymentStatus === "advance_paid"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {notification.booking.paymentStatus}
                  </span>
                )}
              </div>
              {notification.booking && (
                <div className="mt-4 p-4 bg-gray-900 rounded-md">
                  <h4 className="font-semibold text-white mb-2">Booking Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-white">
                    <p>
                      <span className="font-medium">Service:</span> {notification.booking.serviceName}
                    </p>
                    <p>
                      <span className="font-medium">Booking ID:</span> {notification.booking.bookingId}
                    </p>
                    <p>
                      <span className="font-medium">Total Payment:</span> ₹{notification.booking.totalPayment}
                    </p>
                    <p>
                      <span className="font-medium">Advance Payment:</span> ₹{notification.booking.advancePayment}
                    </p>
                    <p>
                      <span className="font-medium">Balance Payment:</span> ₹{notification.booking.balancePayment}
                    </p>
                    <p>
                      <span className="font-medium">Work Status:</span> {notification.booking.workStatus}
                    </p>
                  </div>
                  {notification.booking.paymentStatus === "advance_paid" && notification.booking.bookingId && (
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                      onClick={() => handleContinuePayment(notification.booking?.bookingId)}
                    >
                      Confirm and Continue Payment
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
};

export default NotificationPage;
