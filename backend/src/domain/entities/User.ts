export interface User{
    firstName:string;
    lastName:string;
    email:string;
    mobileNumber:string; 
    password:string;
    otp?:string,
    otpExpiresAt?:Date,
    isVerified?:Boolean,
    isBlocked?:Boolean,
    latitude?: number;
    longitude?: number;
    locationName?:string;
    googleId?: string;

}