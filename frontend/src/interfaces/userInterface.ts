import { Address } from "./addressInterface";

export interface SignupInterface {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    password: string;
    confirmpassword: string;
    isOtpEmail?: boolean;
    otpMethod?: string;
}

export interface UserProfileInterface {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePic?: string;
    mobileNumber?: string;
};


