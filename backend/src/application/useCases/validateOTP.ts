import { OTPModel } from "../../infrastructure/database/models/OTPModel";
import WorkerModel from "../../infrastructure/database/models/workerModel";
import UserModel from "../../infrastructure/database/models/userModels";

import jwt from 'jsonwebtoken'



interface ValidateOtpResponse {
    valid: boolean;
    role?: string; 
    token?:string;
}
export const validateOtp = async (email:string,otp:string,person: number): Promise<ValidateOtpResponse> => {

    try {
        const otpEntry = await OTPModel.findOne({ email, otp });
        if (!otpEntry) {
            throw new Error('Invalid OTP');
        }

        if (otpEntry.expiresAt < new Date()) {
            throw new Error('OTP has expired');
        }
        

       
        await OTPModel.deleteOne({ _id: otpEntry._id });

        let userRole: string;
       // For User
        if (person === 1) { 
            const user = await UserModel.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }
         
            user.isVerified = true;
            await user.save(); 
            userRole = 'user'; 

            // For Worker
        } else if (person === 0) { 
            const worker = await WorkerModel.findOne({ email });
            if (!worker) {
                throw new Error('Worker not found');
            }
            
            worker.isVerified = true;
            await worker.save(); 
            userRole = 'worker'; 
        } else {
            throw new Error('Invalid person type');
        }

        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) {
            throw new Error('JWT secret key is not defined');
        }

        
        const token = jwt.sign({ email, role: userRole }, secretKey, { expiresIn: '1h' });

        
        return { valid: true, role: userRole, token };
    } catch (error: any) {
        throw new Error(error.message);
    }
};