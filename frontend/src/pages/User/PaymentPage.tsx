import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface BookingDetails {
    selectedDate: string;
    selectedSlot: string;
    // workLocation: string;
    workDescription: string;
    serviceName:string;
    workerName:string;
}

const PaymentPage: React.FC = () => {
    const location = useLocation();
    const {
        bookingDetails = {} as BookingDetails,
        workerId = '',
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

                // Extract start and end time from the slotId
                const [startTime, endTime] = selectedSlot.split('-').slice(1);

                if (!startTime || !endTime) return;

                // Convert times to Date objects for calculation
                const selectedDate = new Date(bookingDetails.selectedDate);
                const start = new Date(selectedDate);
                const end = new Date(selectedDate);

                const [startHour, startMinute] = startTime.split(':').map(Number);
                const [endHour, endMinute] = endTime.split(':').map(Number);

                start.setHours(startHour, startMinute);
                end.setHours(endHour, endMinute);

                // Calculate duration in hours
                const durationInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                // Calculate total amount
                const total = durationInHours * workerRate;

                // Calculate platform charge (10%)
                const platformFee = total * 0.1;

                // Calculate advance payment (50%)
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
            <h1 className="text-2xl font-bold mb-4">Payment Page</h1>
            <p><strong>Worker:</strong> {workerName}</p>
            <p><strong>Booking Date:</strong> {new Date(bookingDetails.selectedDate || '').toDateString()}</p>
            <p><strong>Slot:</strong> {bookingDetails.selectedSlot}</p>
            <img src={bookingDetails.serviceImage} alt={bookingDetails.serviceName} className="mb-4 w-20 h-20" />
            <p><strong>Serrvice Name : {bookingDetails.serviceName}</strong></p>
            {/* <p><strong>Work Location:</strong> {bookingDetails.workLocation}</p> */}
            <p><strong>Description:</strong> {bookingDetails.workDescription}</p>
            <p><strong>Description:</strong> {bookingDetails.workDescription}</p>
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Payment Details</h2>
                <p><strong>Hourly Rate:</strong> ${workerRate.toFixed(2)}</p>
                <p><strong>Total Amount:</strong> ${totalAmount.toFixed(2)}</p>
                <p><strong>Platform Charge (10%):</strong> ${platformCharge.toFixed(2)}</p>
                <p><strong>Total Amount (with Platform Charge):</strong> ${finalAmount.toFixed(2)}</p>
                <p><strong>Advance Payment (50%):</strong> ${(finalAmount * 0.5).toFixed(2)}</p>
            </div>

            <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-100">
                <h3 className="text-lg font-semibold mb-2">Terms and Conditions</h3>
                <p className="mb-2">
                    <strong>1. Payment Terms:</strong> After completing the work, you are required to pay the remaining balance.
                </p>
                <p className="mb-2">
                    <strong>2. Cancellation Policy:</strong> If you cancel the booking after making the advance payment, the advance amount will not be refunded. Please be careful when making your booking.
                </p>
                <p className="mb-2">
                    <strong>3. Payment in Advance:</strong> You need to pay 50% of the total amount in advance to secure the booking.
                </p>
                <p>
                    We appreciate your understanding and cooperation. Thank you for choosing our services!
                </p>
            </div>


            <button className="bg-green-500 text-white px-4 py-2 rounded mt-4">
                Proceed to Payment
            </button>
        </div>
    );
};

export default PaymentPage;
