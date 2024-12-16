import mongoose from 'mongoose';

export interface User {
   
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    password: string;
    role: string;
    otp?: string;
    otpExpiresAt?: Date;
    isVerified?: boolean;
    isBlocked?: boolean;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    googleId?: string;
}
