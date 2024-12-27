import { ObjectId } from "mongoose";

export interface Booking {
    id?: string; // Optional field for internal use
    bookingId: string; // Required unique identifier for the booking
    slotId: string; // ID for the booked slot
    workerId: string | ObjectId; // Reference to the worker (ObjectId or string)
    userId: string | ObjectId; // Reference to the user (ObjectId or string)
    date: Date; // Date of the booking
    workDescription: string; // Description of the work to be done
    workLocation?: { // Optional location details
        address: string; // Address of the work location
        latitude: number; // Latitude of the work location
        longitude: number; // Longitude of the work location
    };
    workerName:string;
    serviceName:string;
    serviceImage:string;
    paymentStatus: string; // Payment status (e.g., Pending, Paid, Cancelled)
}
