import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../../domain/entities/User';

export interface UserDocument extends User, Document {}

const userSchema = new Schema<UserDocument>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    latitude: { type: Number },
    longitude: { type: Number },
    locationName: { type: String },
    googleId: { type: String },
});

const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;
