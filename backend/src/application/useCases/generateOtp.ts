import crypto from 'crypto';
import { OTPModel } from '../../infrastructure/database/models/OTPModel';
import { sendOtpEmail } from '../../infrastructure/services/emailService';

export const generateOtp = async (email: string): Promise<void> => {
    try {
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const otpEntry = new OTPModel({ email, otp, expiresAt });
        await otpEntry.save();
        await sendOtpEmail(email, otp);
    } catch (error: any) {
        throw new Error(error.message);
    }
};
