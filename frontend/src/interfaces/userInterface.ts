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
