import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createBooking, createCheckoutSession } from '../../services/userService';
import Swal from 'sweetalert2';

interface BookingDetails {
    date: Date;
    slotId: string;
    workLocation: {
        address: string;
        latitude: number;
        longitude: number;
    };
    workDescription: string;
    workerId: string;
    userId: string;
    paymentStatus: string;
    workerName: string;
    serviceImage: string;
    serviceName: string; 
    workerRate:number;
}

const PaymentPage: React.FC = () => {
    const location = useLocation();
    const {
        bookingDetails = {} as BookingDetails,
        workerRate = 0,
    } = location.state || {};
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [platformCharge, setPlatformCharge] = useState<number>(0);
    const [advancePayment, setAdvancePayment] = useState<number>(0);
    const [finalAmount, setFinalAmount] = useState<number>(0);
    const [balanceAmount , setBalanceAmount] = useState<number>(0);

    useEffect(() => {
        if (bookingDetails && workerRate) {
            const calculateAmount = () => {
                const { slotId = '', date } = bookingDetails; 

                if (!slotId) return;

                const [startTime, endTime] = slotId.split('-').slice(1);
                if (!startTime || !endTime) return;

                const selectedDate = new Date(date); 
                const start = new Date(selectedDate);
                const end = new Date(selectedDate);

                const [startHour, startMinute] = startTime.split(':').map(Number);
                const [endHour, endMinute] = endTime.split(':').map(Number);

                start.setHours(startHour, startMinute);
                end.setHours(endHour, endMinute);

                const durationInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                const total = durationInHours * workerRate;
                const platformFee = total * 0.1;
                const advance = platformFee + (total * 0.2);
                const finalAmount = total + platformFee; // Total amount with platform charge
                const balance = finalAmount - advance; 

                setTotalAmount(total);
                setPlatformCharge(platformFee);
                setAdvancePayment(advance);
                setFinalAmount(finalAmount);
                setBalanceAmount(balance)
            };

            calculateAmount();
        }
    }, [bookingDetails, workerRate]);
console.log("balance" , balanceAmount)
    const handleBookingSubmit = async () => {
        console.log("bbbb", bookingDetails);
        const newBooking = {
            ...bookingDetails,
            totalPayment: finalAmount, 
            advancePayment:advancePayment,
            balancePayment:balanceAmount,
        };
        console.log("newBooking", newBooking);
        
        try {
            // Create the booking
            const response = await createBooking(newBooking);
            if (response.status === 201) {
                Swal.fire('Success', 'Booking created successfully!', 'success');
              console.log("bookingId" , response.data.bookingId)
                // Create a checkout session with Stripe
                const checkoutResponse = await createCheckoutSession({
                    amount: advancePayment * 100,
                    bookingId: response.data.bookingId, 
                    paymentType: 'advance',
                    successUrl: `https://www.homeservicebooking.xyz/booking-success?bookingId=${response.data.bookingId}`,
                });
                Swal.close();

        if (checkoutResponse.url) {
            // Redirect to the Stripe checkout page
            window.location.href = checkoutResponse.url;
        } else {
            Swal.fire('Error', 'Failed to create Stripe session', 'error');
        }
    } else {
        Swal.close(); // Close the loading spinner if booking fails
        Swal.fire('Error', response.data.message || 'Failed to create booking', 'error');
    }
} catch (error) {
    console.error(error);
    Swal.close(); // Ensure the loading spinner is closed on error
    Swal.fire('Error', 'An unexpected error occurred.', 'error');
}
    };
    
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Review and Proceed to Payment</h1>

            <div className="flex flex-wrap md:flex-nowrap bg-gray-900 border rounded-lg p-6 shadow-lg gap-6">
                <div className="w-full md:w-1/2">
                    <h2 className="text-xl text-white font-semibold mb-4">Service Details</h2>
                    <div className="flex items-center text-white mb-4">
                        <img
                            src={bookingDetails.serviceImage || 'https://via.placeholder.com/100'}
                            alt={bookingDetails.serviceName}
                            className="w-20 h-20 mr-4 rounded shadow"
                        />
                        <p className="font-semibold">{bookingDetails.serviceName}</p>
                    </div>
                    <p className="text-white">
                        <strong>Worker:</strong> {bookingDetails.workerName}
                    </p>
                    <p className="text-white">
                        <strong>Booking Date:</strong>{' '}
                        {new Date(bookingDetails.date || '').toDateString()} 
                    </p>
                    <p className="text-white">
                        <strong>Slot:</strong> {bookingDetails.slotId}
                    </p>
                    <p className="text-white">
                        <strong>Description:</strong> {bookingDetails.workDescription}
                    </p>
                </div>

                <div className="w-full md:w-1/2 bg-gray-300 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                    <p>
                        <strong>Hourly Rate:</strong> ₹{workerRate.toFixed(2)}
                    </p>
                    <p>
                        <strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}
                    </p>
                    <p>
                        <strong>Platform Charge (10%):</strong> ₹{platformCharge.toFixed(2)}
                    </p>
                    <p>
                        <strong>Total Amount (with Platform Charge):</strong> ₹ {finalAmount.toFixed(2)}
                    </p>
                    <p>
                        <strong>Advance Payment (30%):</strong> ₹{advancePayment.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="mt-8 bg-gray-300 border p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Terms and Conditions</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Payment Terms:</strong> After completing the work, you are required
                        to pay the remaining balance.
                    </li>
                    <li>
                        <strong>Cancellation Policy:</strong> If you cancel the booking after
                        making the advance payment, the advance amount will not be refunded.
                    </li>
                    <li>
                        <strong>Payment in Advance:</strong> 30% of the total
                        amount is required in advance to secure the booking.
                    </li>
                </ul>
            </div>

            <div className="text-center mt-6">
                <button
                    onClick={handleBookingSubmit}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600"
                >
                    Proceed to Payment
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
