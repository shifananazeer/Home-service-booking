import { useState, useEffect } from 'react';
import { markBookingAsCompleted, todaysBooking } from '../../services/workerService';
import { useNavigate } from 'react-router-dom';
import socket from '../../utils/socket';

interface WorkLocation {
  address: string;
  latitude: number;
  longitude: number;
}

interface Booking {
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
  workLocation: WorkLocation;
}

export default function WorkerTodayBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const workerId = localStorage.getItem('workerId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodayBookings = async () => {
      try {
        if (!workerId) {
          throw new Error('Invalid workerId');
        }
        const data = await todaysBooking(workerId);
        console.log("today booking " , data)
        setBookings(data.bookings|| []);
      } catch (err) {
        setError("Failed to load today's bookings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayBookings();
  }, [workerId]);

  useEffect(() => {
    bookings.forEach((booking) => {
      if (booking.userId) {
        const roomId = `${workerId}-${booking.userId}`;
        socket.emit('notification-join-room', roomId);
        console.log("worker Joined notification room" , roomId)
      }
    });

    return () => {
      bookings.forEach((booking) => {
        if (booking.userId) {
          const roomId = `${workerId}-${booking.userId}`;
          socket.emit('notification-leave-room', roomId);
        }
      });
    };
  }, [bookings, workerId]);

  const markAsCompleted = async (id: string, userId: string , bookingId:string , serviceName:string , workerName:string) => {
    try {
      const response = await markBookingAsCompleted(id);
      console.log("Response from markBookingAsCompleted:", response); 
  
      if (response && response.message === 'Work status updated and notification sent.') {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === id
              ? { ...booking, workStatus: 'completed' }
              : booking
          )
        );
  
        const roomId = `${workerId}-${userId}`; 
        socket.emit('send-notification', {
          roomId,
          message: `Booking ${bookingId} for ${serviceName} has been marked as completed by ${workerName}.`,
          bookingId:bookingId
        });
        console.log("Notification emitted to room:", roomId); 
      } else {
        console.error("Unexpected response from markBookingAsCompleted:", response); 
      }
    } catch (error) {
      console.error('Failed to mark as completed:', error); 
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
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Today's Works</h1>
      {bookings && bookings.length === 0 ? (
        <p className="text-center text-gray-500">No bookings for today.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="border-gray-600 border rounded-lg p-4 shadow-sm bg-gray-900"
            >
              <div className="flex items-center mb-2">
                <img
                  src={booking.serviceImage}
                  alt={booking.serviceName}
                  className="w-10 h-10 rounded-full mr-2 text-white"
                />
                <h2 className="text-lg font-semibold text-white">
                  {booking.serviceName}
                </h2>
              </div>
              <p className="text-white">
                <strong>Booking ID:</strong> {booking.bookingId}
              </p>
              <p className="text-white">
                <strong>Time Slot:</strong> {booking.slotId}
              </p>
              <p className="text-white">
                <strong>Description:</strong> {booking.workDescription}
              </p>
              <p className="text-white">
                <strong>Address:</strong> {booking.workLocation.address}
              </p>
              <p
                className={`mt-2 font-semibold ${
                  booking.paymentStatus === 'Cancelled'
                    ? 'text-red-500'
                    : booking.paymentStatus === 'Pending'
                    ? 'text-yellow-500'
                    : 'text-green-500'
                }`}
              >
                Status: {booking.paymentStatus}
              </p>
              {booking.workStatus !== 'completed' ? (
                <button
                  onClick={() => markAsCompleted(booking._id, booking.userId , booking.bookingId , booking.serviceName , booking.workerName)}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition"
                >
                  Mark as Completed
                </button>
              ) : (
                <p className="mt-4 text-green-500">
                  Work Status: {booking.workStatus}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
