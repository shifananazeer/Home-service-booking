import mongoose, { Schema, Document } from 'mongoose';
import { Worker } from '../../../domain/entities/worker';

export interface WorkerDocument extends Worker {}

const workerSchema = new Schema<WorkerDocument>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    skills: { type: [String], required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    expirience:{type:Number},
    hourlyRate:{type: Number},
    status: {
        type: String,
        enum: ['available', 'not available'],
        default: 'available',
    },
    profilePic:{type:String},
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    latitude: { type: Number },
    longitude: { type: Number },
    locationName: { type: String },
});

const WorkerModel = mongoose.model<WorkerDocument>('Worker', workerSchema);

export default WorkerModel;
