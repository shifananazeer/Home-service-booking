import { OTPModel } from "../../infrastructure/database/models/OTPModel";
import WorkerModel from "../../infrastructure/database/models/workerModel";
import UserModel from "../../infrastructure/database/models/userModels";

import jwt from "jsonwebtoken";

interface ValidateOtpResponse {
    valid: boolean;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
}

export const validateOtp = async (
    email: string,
    otp: string,
    person: number
): Promise<ValidateOtpResponse> => {
    try {
        const otpEntry = await OTPModel.findOne({ email, otp });
        if (!otpEntry) {
            throw new Error("Invalid OTP");
        }
        if (otpEntry.expiresAt < new Date()) {
            throw new Error("OTP has expired");
        }
        await OTPModel.deleteOne({ _id: otpEntry._id });
        let userRole: string;
        let userId: string;

        // For User
        if (person === 1) {
            const user = await UserModel.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }
            user.isVerified = true;
            await user.save();

            userRole = "user";
            userId = user._id.toString();
        } 
        // For Worker
        else if (person === 0) {
            const worker = await WorkerModel.findOne({ email });
            if (!worker) {
                throw new Error("Worker not found");
            }

            worker.isVerified = true;
            await worker.save();

            userRole = "worker";
            userId = worker._id.toString();
        } else {
            throw new Error("Invalid person type");
        }

        const secretKey = process.env.ACCESS_TOKEN_SECRET;
        const refreshSecretKey = process.env.REFRESH_TOKEN_SECRET;

        if (!secretKey || !refreshSecretKey) {
            throw new Error("JWT secret keys are not defined");
        }
        const accessToken = jwt.sign({ email, role: userRole }, secretKey, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ email, role: userRole }, refreshSecretKey, { expiresIn: "7d" });
        return { valid: true, role: userRole, accessToken, refreshToken, userId };
    } catch (error: any) {
        throw new Error(error.message);
    }
};
