export interface User {
    firstName: string; // User's first name
    lastName: string; // User's last name
    email: string; // User's email
    mobileNumber: string; // User's mobile number
    password: string; // Hashed password
    role: string; // Role of the user
    otp?: string; // Optional OTP
    otpExpiresAt?: Date; // Optional OTP expiry time
    isVerified?: boolean; // Optional verification flag (default is false)
    isBlocked?: boolean; // Optional block status
    latitude?: number; // Optional latitude
    longitude?: number; // Optional longitude
    locationName?: string; // Optional location name
    googleId?: string; // Optional Google ID for Google authentication
}
