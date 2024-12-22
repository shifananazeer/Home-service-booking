// domain/entities/Availability.ts

import { ObjectId } from "mongoose";

export interface Availability {
    _id?: string; // Optional for compatibility with Mongoose
    workerId: string | ObjectId;
    date: Date;
    slots: Array<{
        slotId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
    }>;
    createdAt?: Date; // Optional because Mongoose handles this
    updatedAt?: Date; // Optional because Mongoose handles this
}

export interface AvailabilitySlot {
    slotId: string;        // Unique identifier for the slot
    startTime: string;     // Start time of the slot (ISO 8601 format)
    endTime: string;       // End time of the slot (ISO 8601 format)
    isAvailable: boolean;   // Availability status of the slot
}
