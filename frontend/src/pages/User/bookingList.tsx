import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchBookigs } from '../../services/userService';

interface Booking {
  id: string;
  workerName: string;
  serviceName: string;
  date: string;
 slotId:string;
 serviceImage:string;
 workDescription:string;
  paymentStatus: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const parseSlotId = (slotId: string) => {
    const [day, startTime, endTime] = slotId.split('-');
    return { day, startTime, endTime };
  };

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
    <div className="container mx-auto px-3 py-8">
      <h1 className="text-3xl font-bold mb-2">Your Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-gray-600">You have no bookings at the moment.</p>
      ) : (
        bookings.map((booking) => {
          const { day, startTime, endTime } = parseSlotId(booking.slotId);
  
          return (
            <div
              key={booking.id}
              className="flex bg-gray-900 rounded-lg shadow-md overflow-hidden mb-3"
              style={{ height: "150px" }} // Adjusted height
            >
              {/* Left Section: Details */}
              <div className="flex-1 p-2 overflow-hidden ">
                <h2 className="text-xl text-white font-semibold mb-1 pl-3">{booking.serviceName}</h2>
                <p className="text-white mb-2 pl-3 ">with {booking.workerName}</p>
                <div className="mb-1">
                  <p className="text-sm text-white pl-3">Date: {day}</p>
                  <p className="text-sm text-white pl-3">
                    Time: {startTime} - {endTime}
                  </p>
                </div>
                <span
                  className={`rounded-full text-xs font-semibold p-1 ${
                    booking.paymentStatus === "Confirmed"
                      ? "bg-green-200 text-green-800"
                      : booking.paymentStatus === "Pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : booking.paymentStatus === "Completed"
                      ? "bg-blue-200 text-blue-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {booking.paymentStatus}
                </span>
              
              </div>

             {/* Second Section: Description */}
             <div className="flex p-2 items-center justify-center">
              <p className="text-sm text-white">Reason: {booking.workDescription}</p>
            </div>

            {/* Third Section: Service Image */}
            <div className="w-1/3 flex items-center justify-center p-2">
              <img
                src={booking.serviceImage} // Ensure booking includes a `serviceImage` field
                alt={booking.serviceName}
                className="object-cover w-20 h-20 rounded-lg" // Adjust size as needed
              />
            </div>

             {/* Right Section: Cancel Button */}
             <div className="w-1/5 flex items-center justify-center">
              {booking.paymentStatus !== "Cancelled" &&
                booking.paymentStatus !== "Completed" && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
            </div>
          </div>
        );
      })
    )}
    <button
      onClick={() => navigate("/book")}
      className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Book New Service
    </button>
  </div>
);
  
}  
    

export default BookingList;
