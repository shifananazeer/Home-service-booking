import mongoose, { Document, Schema } from 'mongoose';

// Define the OTP interface
export interface IOTP extends Document {
    email: string;
    otp: string;
    expiresAt: Date;
}

// Create the OTP schema
// const otpSchema: Schema = new Schema({
//     email: { type: String, required: true },
//     otp: { type: String, required: true },
//     expiresAt: { type: Date, required: true }
// });
const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: '5m' } }, // TTL Index
});

// Create the OTP model
export const OTPModel = mongoose.model<IOTP>('OTP', otpSchema);
