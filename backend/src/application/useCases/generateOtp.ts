import crypto from 'crypto';
import { OTPModel } from '../../infrastructure/database/models/OTPModel';
import { sendOtpEmail } from '../../infrastructure/services/emailService';
import UserModel from '../../infrastructure/database/models/userModels';
import WorkerModel from '../../infrastructure/database/models/workerModel';
export const generateOtp = async (email: string, person: number): Promise<void> => {
      
    try {
        let user;
        if(person == 1) {
            user = await UserModel.findOne({email});
        }else if(person == 0) {
            user = await WorkerModel.findOne({email});
        }
        if(!user) {
            throw new Error (' User not found')
        }
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const otpEntry = new OTPModel({ email, otp, expiresAt });
        await otpEntry.save();
        await sendOtpEmail(email, otp);
    } catch (error: any) {
        throw new Error(error.message);
    }
};
