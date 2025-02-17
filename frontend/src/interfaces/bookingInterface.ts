import { Types } from "mongoose";

export interface Booking {
    id?: string;
    bookingId?: string;
    workerId:string;
    workerName: string;  
    serviceImage:string;
    serviceName:string;
    userId: string  
    date: Date;
    workLocation: {
        address: string;
        latitude: number;
        longitude: number;
    };
    workDescription: string;
    slotId: string;
    paymentStatus: string;
    createdAt?: Date;
    updatedAt?: Date;
}
