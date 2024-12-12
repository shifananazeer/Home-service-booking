import { OTPModel } from "../../infrastructure/database/models/OTPModel";


export const validateOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
        const otpEntry = await OTPModel.findOne({ email, otp });
        if (!otpEntry) {
            throw new Error('Invalid OTP');
        }

        if (otpEntry.expiresAt < new Date()) {
            throw new Error('OTP has expired');
        }

        // If OTP is valid and not expired, you may want to delete it
        await OTPModel.deleteOne({ _id: otpEntry._id });
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};