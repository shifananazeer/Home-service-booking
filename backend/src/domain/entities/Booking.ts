import { ObjectId } from "mongoose";

export interface Booking {
    id?: string;
    bookingId: string; 
    slotId: string;
    workerId: string | ObjectId; 
    userId: string | ObjectId; 
    date: Date;
    workDescription: string; 
    workLocation?: { 
        address: string; 
        latitude: number;
        longitude: number; 
    };
    workerName:string;
    serviceName:string;
    serviceImage:string;
    paymentStatus: string; 
    rate:number;
    createdAt?: Date;
  
}
