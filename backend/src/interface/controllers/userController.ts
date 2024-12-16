import { NextFunction , Request , Response } from "express";
import { registerUser } from "../../application/useCases/registerUser";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { loginUser } from "../../application/useCases/loginUser";
import { validateOtp } from "../../application/useCases/validateOTP";
import { generateOtp } from "../../application/useCases/generateOtp";
import { sendResetLink } from "../../application/useCases/passwordResent";

import { resetPassword } from "../../application/useCases/passwordResent";
import { validateToken } from "../../application/useCases/passwordResent";

import { blockUser,unblockUser } from "../../application/useCases/user/blockUser";



export const userController = {
    register: async (req: Request, res: Response) => {
        try {
          const user = await registerUser(UserRepositoryImpl, req.body);
          await generateOtp(user.email,1);
          res
            .status(200)
            .json({ message: "User registered. OTP sent to your email." });
        } catch (error: any) {
          res.status(400).json({ message: error.message });
        }
      },
    login: async (req: Request, res: Response) => {
        try {
          const token = await loginUser(
            UserRepositoryImpl,
            req.body.email,
            req.body.password
          );
          res.cookie("auth_token", token, { httpOnly: true, maxAge: 86400000 });
          res.status(200).json({ message: "You can now log in.", token });
        } catch (error: any) {
          res.status(400).json({ message: error.message });
        }
      },
    validateOtp: async (req: Request, res: Response) => {
        try {
            const result = await validateOtp(req.body.email, req.body.otp , 1);
            res.cookie('auth_token', result.token, { httpOnly: true, maxAge: 8400000 });
            res.status(200).json({
                message: 'OTP verified Successfully. You can Log in',
                valid: result.valid,
                role: result.role, // Include the role
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    resendOtp: async (req: Request, res: Response) => {
        console.log("body" ,req.body)
        const { email } = req.body;
        try {
            await generateOtp(email ,1);
            res.status(200).json({ message: 'OTP resent to your email' });
        } catch (error: any) {
            console.error('Error sending OTP:', error); 
            res.status(400).json({ message: error.message || 'Failed to resend OTP' });
        }
    },

     forgotPassword :async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;
    
            if (!email) {
                res.status(400).json({ message: 'Email is required' });
                return;
            }
            await sendResetLink(email , 1);
    
            // Add logic to handle password reset
            res.status(200).json({ message: 'Password reset link sent successfully.' });
        } catch (error: any) {
            console.error('Error in forgotPassword:', error.message);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    validateResetToken: async (req: Request, res: Response): Promise<void> => {
        try {
            const { token } = req.params;

            const isValid = await validateToken(token);
            if (!isValid) {
                res.status(400).json({ message: 'Invalid token' });
                return;
            }

            res.status(200).json({ message: 'Token is valid' });
        } catch (error: any) {
            console.error('Error in validateResetToken:', error.message);
            res.status(500).json({ message: error.message });
        }
    },

    resetPassword: async (req: Request, res: Response): Promise<void> => {
        console.log("body",req.body)
        try {
            const { token, newPassword } = req.body;

            await resetPassword(token, newPassword);

            res.status(200).json({ message: 'Password reset successfully' });
        } catch (error: any) {
            console.error('Error in resetPassword:', error.message);
            res.status(500).json({ message: error.message });
        }
    },
   
    blockUser : async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params;
    
        try {
            const updatedUser = await blockUser(userId);
            if (!updatedUser) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.json({ message: 'User blocked successfully', user: updatedUser });
        } catch (error) {
            console.error('Error blocking user:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    unblockUser : async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params;
    
        try {
            const updatedUser = await unblockUser(userId);
            if (!updatedUser) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.json({ message: 'User unblocked successfully', user: updatedUser });
        } catch (error) {
            console.error('Error unblocking user:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

