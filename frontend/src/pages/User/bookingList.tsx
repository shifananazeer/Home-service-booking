import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchBookigs } from '../../services/userService';

interface Booking {
  id: string;
  workerName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      const userId = localStorage.getItem('user_Id'); // Ensure this key matches your backend/localStorage setup
      if (!userId) {
        setError('User ID is missing');
        setIsLoading(false);
        return;
      }

      try {
      
        const fetchedBookings = await fetchBookigs(userId);
        console.log("Fetched Bookings:", fetchedBookings.bookings);
        setBookings(fetchedBookings.bookings);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again later.');
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await axios.patch(`/api/bookings/cancel/${bookingId}`); // Update with your API endpoint
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: 'Cancelled' as const }
            : booking
        )
      );
    } catch (err) {
      setError('Failed to cancel booking. Please try again.');
    }
  };

  if (isLoading) {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-gray-600">You have no bookings at the moment.</p>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-lg shadow-md overflow-hidden mb-4"
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2">{booking.serviceName}</h2>
              <p className="text-gray-600 mb-4">with {booking.workerName}</p>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Date: {booking.date}</p>
                <p className="text-sm text-gray-500">
                  Time: {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  booking.status === 'Confirmed'
                    ? 'bg-green-200 text-green-800'
                    : booking.status === 'Pending'
                    ? 'bg-yellow-200 text-yellow-800'
                    : booking.status === 'Completed'
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-red-200 text-red-800'
                }`}
              >
                {booking.status}
              </span>
              {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                <div className="mt-4">
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
      <button
        onClick={() => navigate('/book')}
        className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Book New Service
      </button>
    </div>
  );
};

export default BookingList;
