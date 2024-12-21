// infrastructure/models/AvailabilityModel.ts

import mongoose, { Schema, Document } from 'mongoose';
import { Availability } from '../../../domain/entities/Availability';

export interface AvailabilityDocument extends Availability {}

const SlotSchema = new Schema({
    slotId: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, required: true },
}, { _id: false }); // No separate _id for slots

const AvailabilitySchema = new Schema<AvailabilityDocument>({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    date: { type: Date, required: true },
    slots: { type: [SlotSchema], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Add a pre-save hook to update the `updatedAt` field
AvailabilitySchema.pre<AvailabilityDocument>('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Mongoose automatically adds the `_id` field
export const AvailabilityModel = mongoose.model<AvailabilityDocument>('Availability', AvailabilitySchema);
export default AvailabilityModel;
