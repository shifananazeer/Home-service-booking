import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBookingDetails, updateBookingStatus, updateWallet } from '../../services/userService';
import { CheckCircle, Calendar, Clock, User, Briefcase } from 'lucide-react';

interface BookingDetails {
  serviceName: string;
  workerName: string;
  date: string;
  slotId: string;
  totalPayment: number;
  advancePayment: number;
  balancePayment: number;
  workerId:string;
}

const BookingSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const query = new URLSearchParams(location.search);
  const bookingId = query.get('bookingId');
  const hasUpdatedWallet = useRef(false);
  useEffect(() => {
    const fetchBookingDetails = async () => {
        if (hasUpdatedWallet.current) return; // Prevent multiple calls
        hasUpdatedWallet.current = true; // Mark as called

        setLoading(true);
        try {
            if (bookingId) {
                const details = await getBookingDetails(bookingId);
                setBookingDetails(details);

                if (details?.workerId && details?.advancePayment) {
                    console.log('Updating booking status...');
                    const response = await updateBookingStatus(bookingId, 'advance_paid');
                    console.log("Booking status updated!", response);

                    const walletData = {
                        userId: details.workerId,
                        amount: details.advancePayment,
                        transactionDetails: {
                            type: 'credit',
                            description: 'Advance payment for booking',
                            relatedBookingId: bookingId,
                        },
                    };

                    console.log("Sending request to update wallet:", walletData);
                    const walletResponse = await updateWallet(walletData, bookingId);
                    console.log("Wallet API Response:", walletResponse);
                } else {
                    console.error('Invalid booking details:', details);
                }
            }
        } catch (error) {
            console.error('Failed to fetch booking details:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchBookingDetails();
}, [bookingId]);
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the details for your booking. Please try again or contact support.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 animate-bounce" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Booking Confirmed!</h2>
          <p className="mt-2 text-lg text-gray-600">
            Your booking has been confirmed and payment has been processed successfully.
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-700">{bookingDetails.serviceName}</span>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-700">{bookingDetails.workerName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-700">{new Date(bookingDetails.date).toDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-700">{bookingDetails.slotId}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold text-gray-900">₹{bookingDetails.totalPayment.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Advance Payment:</span>
              <span className="font-semibold text-green-600">₹{bookingDetails.advancePayment.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Balance Due:</span>
              <span className="font-semibold text-red-600">₹{bookingDetails.balancePayment.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/booking-list')}
            className="flex-1 py-2 px-4 border border-green-600 rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
          >
            View Booking List
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;

