import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../../domain/entities/User';

export interface UserDocument extends User {
}

const UserSchema = new Schema<UserDocument>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    profilePic: { type: String },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    latitude: { type: Number },
    longitude: { type: Number },
    locationName: { type: String },
    googleId: { type: String },
});

// Mongoose will automatically add the `_id` field
export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
export default UserModel;
