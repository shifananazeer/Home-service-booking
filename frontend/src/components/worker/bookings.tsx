import React, { useState, useEffect } from 'react';
import { getBookings, getWorkerLocation } from '../../services/workerService';
import { FaCalendarCheck } from 'react-icons/fa';

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
  workStatus:string;
  
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
  const [limit] = useState<number>(5); 

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const workerId = localStorage.getItem('workerId');
  useEffect(() => {
    const fetchBookingsAndLocation = async () => {       
      try {
        if (!workerId) {
          console.error("Worker ID is null. Cannot fetch bookings.");
          return;
        }
        const response = await getBookings(workerId, currentPage, limit);
        console.log("Bookings response:", response);
        if (response.status === 204 || !response.data || !response.data.bookings || response.data.bookings.length === 0) {
          setBookings([]);
          setTotalPages(1);
          return;
        }
        setBookings(response.data.bookings);
        
      
        const totalBookings = response.data.total; 
        const pages = Math.ceil(totalBookings / limit); 
        setTotalPages(pages); 
        setCurrentPage(currentPage); 

      
        const workerLocationResponse = await getWorkerLocation(workerId);
        console.log("Worker location response:", workerLocationResponse);
        setWorkerLocation({
          latitude: workerLocationResponse.address.latitude, 
          longitude: workerLocationResponse.address.longitude, 
        });
      } catch (error) {
        console.error('Error fetching bookings or worker location:', error);
      }
    };

    fetchBookingsAndLocation();
  }, [workerId, currentPage, limit]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
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
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl text-gray-900  font-bold text-center mb-4 flex items-center justify-center">Your Bookings <FaCalendarCheck className="text-3xl ml-2" /></h1>
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        {bookings.length === 0 ? (
    <div className="p-6 text-center text-gray-400">
      <p>No bookings available at the moment.</p>
    </div>
  ) : (
          <ul className="divide-y divide-gray-700">
            {bookings.map((booking) => (
              <li key={booking.bookingId} className="px-6 py-5 hover:bg-gray-700 transition duration-150 ease-in-out">
                <div className="flex items-center space-x-4">
                  <img src={booking.serviceImage || '/placeholder.svg?height=80&width=80'} alt={booking.serviceName} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-100">{booking.customerName}</h3>
                    <p className="mt-1 text-sm text-gray-400">Service: {booking.serviceName}</p>
                    <p className="mt-1 text-sm text-gray-400">Location: {booking.workLocation.address}</p>
                    <p className="mt-1 text-sm text-gray-400">Work Description: {booking.workDescription}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-300">{new Date(booking.date).toLocaleDateString()}</p>
                    <p className="mt-1 text-sm text-gray-400">{booking.slotId}</p>
                    <p className="mt-1 text-sm text-gray-400">payment: {booking.paymentStatus}</p>
                    <p className="mt-1 text-sm text-gray-400">work: {booking.workStatus}</p>
                    <button
                      onClick={() => renderMap(booking)}
                      className="mt-2 text-blue-400 hover:text-blue-300 transition duration-150 ease-in-out"
                    >
                      View on Map
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
           )}
        </div>

        {selectedBooking && workerLocation && (
          <div className="mt-8 bg-gray-800 rounded-lg p-4 relative">
            <h2 className="text-xl font-medium text-gray-100 mb-4">Map View</h2>
            <div className="relative pb-[56.25%] h-0">
              <iframe
                title="Google Map"
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${workerLocation.latitude},${workerLocation.longitude}&destination=${selectedBooking.workLocation.latitude},${selectedBooking.workLocation.longitude}&mode=driving`}
                allowFullScreen
              ></iframe>
            </div>
            {distance && (
              <p className="mt-4 text-sm text-gray-400">
                Distance between worker and work location: {distance} km
              </p>
            )}
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full shadow hover:bg-red-600 focus:outline-none transition duration-150 ease-in-out"
            >
              Close
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <button 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1}
            className="text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            Previous
          </button>
          <p className="text-gray-400">Page {currentPage} of {totalPages}</p>
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            className="text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            Next
          </button>
        </div>

        <p className="mt-4 text-center text-gray-400">
          Total Bookings: {bookings.length}
        </p>
      </div>
    </div>
  );
};

export default WorkerBookings;

