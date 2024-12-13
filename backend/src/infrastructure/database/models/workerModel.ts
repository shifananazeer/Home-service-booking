import mongoose, { Schema, Document } from 'mongoose';

// Define the WorkerDocument interface extending Mongoose's Document
export interface WorkerDocument extends Document {
    name: string;
    email: string;
    phone: string;
    skills: string;
    password: string;
    isVerified: boolean;
}

// Define the Worker schema
const WorkerSchema = new Schema<WorkerDocument>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    skills: { type: String, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
});

// Create the Worker model
const WorkerModel = mongoose.model<WorkerDocument>('Worker', WorkerSchema);

// Export the model and the WorkerDocument interface
export default WorkerModel;
