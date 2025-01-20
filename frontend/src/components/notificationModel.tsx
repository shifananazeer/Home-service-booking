import React from 'react';
import { createCheckoutSession, getBalanceAmount } from '../services/userService';
import Swal from 'sweetalert2';
import { Bell } from 'lucide-react';

interface NotificationModalProps {
  message: string;
  bookingId: string;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ message, bookingId, onClose }) => {
  const onConfirm = async (bookingId: string) => {
    try {
      const response = await getBalanceAmount(bookingId);
      const balanceAmount = response?.data;

      if (balanceAmount) {
        const checkoutResponse = await createCheckoutSession({
          amount: balanceAmount * 100,
          bookingId: bookingId,
          paymentType: 'balance',
          successUrl: `http://localhost:5173/balancePayment-success?bookingId=${bookingId}`
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 rounded-full p-3">
            <Bell className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Notification</h2>
        <p className="text-center mb-8 text-gray-600">{message}</p>
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => onConfirm(bookingId)}
            className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Confirm and Continue Payment
          </button>
          <button 
            onClick={onClose} 
            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition duration-300 ease-in-out"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;

