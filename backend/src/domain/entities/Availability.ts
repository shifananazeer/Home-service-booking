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
