

import { ObjectId } from "mongoose";

export interface Availability {
    _id?: string; 
        workerId: string | ObjectId;
    date: Date;
    slots: Array<{
        slotId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
    }>;
    createdAt?: Date; 
    updatedAt?: Date; 
}

export interface AvailabilitySlot {
    slotId: string;       
    startTime: string;    
    endTime: string;       
    isAvailable: boolean;   
}
