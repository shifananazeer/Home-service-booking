import mongoose, { Document, Schema } from 'mongoose';


export interface IOTP extends Document {
    email: string;
    otp: string;
    expiresAt: Date;
}
const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: '5m' } }, 
});


export const OTPModel = mongoose.model<IOTP>('OTP', otpSchema);
