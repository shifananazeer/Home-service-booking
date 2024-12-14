import { OTPModel } from "../../infrastructure/database/models/OTPModel";
import WorkerModel from "../../infrastructure/database/models/workerModel";
import UserModel from "../../infrastructure/database/models/userModels";

import jwt from 'jsonwebtoken'



interface ValidateOtpResponse {
    valid: boolean;
    role?: string; // Optional, since role may not be available in all cases
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
        

        // If OTP is valid and not expired, you may want to delete it
        await OTPModel.deleteOne({ _id: otpEntry._id });

        let userRole: string;
       
        if (person === 1) { // For User
            const user = await UserModel.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }
            // Update the user's verification status
            user.isVerified = true;
            await user.save(); // Save the changes
            userRole = 'user'; // Set role
        } else if (person === 0) { // For Worker
            const worker = await WorkerModel.findOne({ email });
            if (!worker) {
                throw new Error('Worker not found');
            }
            // Update the worker's verification status
            worker.isVerified = true;
            await worker.save(); // Save the changes
            userRole = 'worker'; // Set role
        } else {
            throw new Error('Invalid person type');
        }

        // Create a JWT token
        const token = jwt.sign({ email, role: userRole }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '1h' });

        // Return success with role and token
        return { valid: true, role: userRole, token };
    } catch (error: any) {
        throw new Error(error.message);
    }
};