import React from 'react';
import axiosInstance from '../utils/axiosInstance';
import { getBalanceAmount } from '../services/userService';

interface NotificationModalProps {
    message: string;
    bookingId:string;
    onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ message,bookingId, onClose }) => {
    const onConfirm = async (bookingId:string) => {
     const balanceAmount = await getBalanceAmount(bookingId)
    }
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Notification</h2>
                <p className="mb-6">{message}</p>
                <button 
                    onClick={onClose} 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                    OK
                </button>
                <button 
                        onClick={()=>onConfirm(bookingId)} // Handle confirm action
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                    >
                        Confirm and Continue Payment
                    </button>
            </div>
        </div>
    );
};

export default NotificationModal;
