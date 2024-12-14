// models/WorkerModel.ts
import mongoose, { Schema } from 'mongoose';
import { Worker } from '../../../domain/entities/worker'

const WorkerSchema = new Schema<Worker>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    skills: { type: [String], required: true }, // Matches `string[]` in the interface
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'worker'], default: 'user' } ,
    locationName: { type: String, required: false },
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false }
});

const WorkerModel = mongoose.model<Worker>('Worker', WorkerSchema);

export default WorkerModel;
