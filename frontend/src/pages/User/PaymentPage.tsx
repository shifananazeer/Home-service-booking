import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface BookingDetails {
    selectedDate: string;
    selectedSlot: string;
    workDescription: string;
    serviceName: string;
    workerName: string;
    serviceImage?: string;
}

const PaymentPage: React.FC = () => {
    const location = useLocation();
    const {
        bookingDetails = {} as BookingDetails,
        workerName = 'Worker',
        workerRate = 0,
    } = location.state || {};

    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [platformCharge, setPlatformCharge] = useState<number>(0);
    const [advancePayment, setAdvancePayment] = useState<number>(0);
    const [finalAmount, setFinalAmount] = useState<number>(0);

    useEffect(() => {
        if (bookingDetails && workerRate) {
            const calculateAmount = () => {
                const { selectedSlot = '' } = bookingDetails;

                if (!selectedSlot) return;

                const [startTime, endTime] = selectedSlot.split('-').slice(1);
                if (!startTime || !endTime) return;

                const selectedDate = new Date(bookingDetails.selectedDate);
                const start = new Date(selectedDate);
                const end = new Date(selectedDate);

                const [startHour, startMinute] = startTime.split(':').map(Number);
                const [endHour, endMinute] = endTime.split(':').map(Number);

                start.setHours(startHour, startMinute);
                end.setHours(endHour, endMinute);

                const durationInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                const total = durationInHours * workerRate;
                const platformFee = total * 0.1;
                const advance = (total + platformFee) * 0.5;

                setTotalAmount(total);
                setPlatformCharge(platformFee);
                setAdvancePayment(advance);
                setFinalAmount(total + platformFee);
            };

            calculateAmount();
        }
    }, [bookingDetails, workerRate]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Review and Proceed to Payment</h1>

            <div className="flex flex-wrap md:flex-nowrap bg-gray-900 border rounded-lg p-6 shadow-lg gap-6">
                {/* Service Details Section */}
                <div className="w-full md:w-1/2">
                    <h2 className="text-xl text-white font-semibold mb-4">Service Details</h2>
                    <div className="flex items-center text-white mb-4">
                        <img
                            src={bookingDetails.serviceImage || 'https://via.placeholder.com/100'}
                            alt={bookingDetails.serviceName}
                            className="w-20 h-20 mr-4 rounded shadow"
                        />
                        <p className="font-semibold ">{bookingDetails.serviceName}</p>
                    </div>
                    <p className='text-white'>
                        <strong>Worker:</strong> {workerName}
                    </p>
                    <p className='text-white'>
                        <strong>Booking Date:</strong>{' '}
                        {new Date(bookingDetails.selectedDate || '').toDateString()}
                    </p>
                    <p className='text-white'>
                        <strong>Slot:</strong> {bookingDetails.selectedSlot}
                    </p>
                    <p className='text-white'>
                        <strong>Description:</strong> {bookingDetails.workDescription}
                    </p>
                </div>

                {/* Payment Calculation Section */}
                <div className="w-full md:w-1/2 bg-gray-300 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                    <p>
                        <strong>Hourly Rate:</strong> ${workerRate.toFixed(2)}
                    </p>
                    <p>
                        <strong>Total Amount:</strong> ${totalAmount.toFixed(2)}
                    </p>
                    <p>
                        <strong>Platform Charge (10%):</strong> ${platformCharge.toFixed(2)}
                    </p>
                    <p>
                        <strong>Total Amount (with Platform Charge):</strong> $
                        {finalAmount.toFixed(2)}
                    </p>
                    <p>
                        <strong>Advance Payment (50%):</strong> ${(finalAmount * 0.5).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Terms and Proceed Button */}
            <div className="mt-8 bg-gray-300 border p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Terms and Conditions</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Payment Terms:</strong> After completing the work, you are required
                        to pay the remaining balance.
                    </li>
                    <li>
                        <strong>Cancellation Policy:</strong> If you cancel the booking after
                        making the advance payment, the advance amount will not be refunded. Please
                        be careful when making your booking.
                    </li>
                    <li>
                        <strong>Payment in Advance:</strong> You need to pay 50% of the total
                        amount in advance to secure the booking.
                    </li>
                </ul>
            </div>

            <div className="text-center mt-6">
                <button className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600">
                    Proceed to Payment
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
