import React, { useState, useEffect } from 'react';
import { getBookings, getWorkerLocation } from '../../services/workerService';

interface WorkLocation {
  address: string;
  latitude: number;
  longitude: number;
}

interface Booking {
  id: string;
  bookingId: string;
  customerName: string;
  date: string;
  slotId: string;
  workDescription: string;
  workLocation: WorkLocation;
  workerName: string;
  serviceImage: string;
  serviceName: string;
  paymentStatus: string;
}

interface WorkerLocation {
  latitude: number;
  longitude: number;
}

const WorkerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [workerLocation, setWorkerLocation] = useState<WorkerLocation | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(1); // Set your default limit per page

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const workerId = localStorage.getItem('workerId');

  useEffect(() => {
    const fetchBookingsAndLocation = async () => {
      try {
        if (!workerId) {
          console.error("Worker ID is null. Cannot fetch bookings.");
          return;
        }

        // Fetch bookings with pagination
        const response = await getBookings(workerId, currentPage, limit);
        console.log("Bookings response:", response);
        setBookings(response.data.bookings);
        
        // Calculate total pages based on the total count of bookings
        const totalBookings = response.data.total; // Total bookings from response
        const pages = Math.ceil(totalBookings / limit); // Calculate total pages
        setTotalPages(pages); // Update total pages
        setCurrentPage(currentPage); // Keep current page as is

        // Fetch worker location
        const workerLocationResponse = await getWorkerLocation(workerId);
        console.log("Worker location response:", workerLocationResponse);
        setWorkerLocation({
          latitude: workerLocationResponse.address.latitude, // Access latitude from address
          longitude: workerLocationResponse.address.longitude, // Access longitude from address
        });// Assuming response contains 'address', 'latitude', and 'longitude'
      } catch (error) {
        console.error('Error fetching bookings or worker location:', error);
      }
    };

    fetchBookingsAndLocation();
  }, [workerId, currentPage, limit]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };
console.log("))))", workerLocation?.latitude)
  const renderMap = (booking: Booking) => {
    setSelectedBooking(booking);
    if (workerLocation) {
      const distance = calculateDistance(
        booking.workLocation.latitude,
        booking.workLocation.longitude,
        workerLocation.latitude,
        workerLocation.longitude
      );
      setDistance(distance.toFixed(2));
   
    }
  };
console.log("workk",workerLocation)
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Bookings</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <li key={booking.bookingId} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{booking.customerName}</h3>
                    <p className="mt-1 text-sm text-gray-500">{booking.serviceName}</p>
                    <p className="mt-1 text-sm text-gray-500">{booking.workLocation.address}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">{new Date(booking.date).toLocaleDateString()}</p>
                    <p className="mt-1 text-sm text-gray-500">{booking.slotId}</p>
                    <button
                      onClick={() => renderMap(booking)}
                      className="mt-2 text-blue-500 hover:underline"
                    >
                      View on Map
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selectedBooking && workerLocation && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Map View</h2>
            <iframe
              title="Google Map"
              width="100%"
              height="400"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${workerLocation.latitude},${workerLocation.longitude}&destination=${selectedBooking.workLocation.latitude},${selectedBooking.workLocation.longitude}&mode=driving`}
              allowFullScreen
            ></iframe>
            {distance && (
              <p className="mt-2 text-sm text-gray-600">
                Distance between worker and work location: {distance} km
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <button 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1}
            className="text-blue-500 hover:underline"
          >
            Previous
          </button>
          <p className="text-gray-600">Page {currentPage} of {totalPages}</p>
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            className="text-blue-500 hover:underline"
          >
            Next
          </button>
        </div>

        <p className="mt-4 text-center text-gray-600">
          Total Bookings: {bookings.length}
        </p>
      </div>
    </div>
  );
};

export default WorkerBookings;
