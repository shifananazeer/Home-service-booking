'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAllBookings } from '../../services/adminService';
import debounce from 'lodash.debounce';

interface Booking {
  _id: string;
  bookingId: string;
  workerId: string;
  userId: {
    _id: string;
    email: string;
  };
  date: string;
  slotId: string;
  workDescription: string;
  workerName: string;
  serviceImage: string;
  serviceName: string;
  paymentStatus: string;
  workLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [limit] = useState<number>(10);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllBookings(currentPage, limit, searchQuery);
      setBookings(data.bookings);
      setTotalPages(data.totalPages); // Ensure this matches your API response
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search query
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setCurrentPage(1); // Reset to the first page on search
    }, 300), // Adjust the debounce time as necessary
    []
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, searchQuery]); // Refetch when these values change

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery(''); // Clear the search query
    setCurrentPage(1); // Reset to the first page on clear
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Bookings</h1>

      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search users..."
          onChange={handleSearch}
          value={searchQuery}
          className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-150 ease-in-out"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="ml-2 py-2 px-3 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none transition duration-150 ease-in-out"
          >
            &times; {/* Close button */}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Booking ID</th>
              <th className="px-4 py-2 text-left">User Email</th>
              <th className="px-4 py-2 text-left">Worker Name</th>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Slot</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-b">
                <td className="px-4 py-2">{booking.bookingId}</td>
                <td className="px-4 py-2">{booking.userId.email}</td>
                <td className="px-4 py-2">{booking.workerName}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <img src={booking.serviceImage} alt={booking.serviceName} className="w-8 h-8 mr-2 rounded-full" />
                    {booking.serviceName}
                  </div>
                </td>
                <td className="px-4 py-2">{new Date(booking.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{booking.slotId}</td>
                <td className="px-4 py-2">{booking.workLocation.address}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded ${
                    booking.paymentStatus === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
