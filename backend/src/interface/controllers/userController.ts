import { NextFunction , Request , Response } from "express";
import { registerUser } from "../../application/useCases/registerUser";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { loginUser } from "../../application/useCases/loginUser";
import { validateOtp } from "../../application/useCases/validateOTP";
import { generateOtp } from "../../application/useCases/generateOtp";
import passport from "../../interface/middleware/passportConfig";
import UserModel from "../../infrastructure/database/models/userModels";
import { ForgotPasswordDto } from "../../domain/entities/ForgotPasswordDto";
import { sendResetLink } from "../../application/useCases/passwordResent";
import jwt from 'jsonwebtoken'
import { OAuth2Client } from "google-auth-library";
import verifyGoogleToken from "../../infrastructure/services/GoogleAuthService";
import { googleLogin } from "../../application/useCases/GoogleLogin";
import { resetUserPassword } from "../../application/useCases/passwordResent";
import { validateToken } from "../../application/useCases/passwordResent";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 




export const userController = {
    register: async (req: Request, res: Response) => {
        try {
          const user = await registerUser(UserRepositoryImpl, req.body);
          await generateOtp(user.email);
          res
            .status(200)
            .json({ message: "User registered. OTP sent to your email." });
        } catch (error: any) {
          res.status(400).json({ message: error.message });
        }
      },
    login: async (req:Request , res: Response) => {
        console.log("Request body:", req.body);
        try {
            const token = await loginUser (
                UserRepositoryImpl,
                req.body.email,
                req.body.password
            );
            res.cookie('auth_token' , token , {
                httpOnly:true,
                secure: process.env.NODE_ENV === 'production',
                maxAge:86400000
            });
            res.cookie("auth_token", token, { httpOnly: true, maxAge: 86400000 });
      res.status(200).json({ message: "You can now log in.", token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
    validateOtp: async (req: Request, res: Response) => {
        try {
            const isValid = await validateOtp(req.body.email, req.body.otp);
            if (isValid) {
                res.status(200).json({ message: 'OTP is valid.' });
            }
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
    resendOtp: async (req: Request, res: Response) => {
        console.log("body" ,req.body)
        const { email } = req.body;
        try {
            await generateOtp(email);
            res.status(200).json({ message: 'OTP resent to your email' });
        } catch (error: any) {
            console.error('Error sending OTP:', error); 
            res.status(400).json({ message: error.message || 'Failed to resend OTP' });
        }
    },
    googleLoginHandler: async (req:Request , res: Response) => {
        try{
            const {token} = req.body;
            if (!token) {
                throw new Error('Google token is required');
            }
            
            const googleUser = await verifyGoogleToken(token);

            // Use googleLogin function for handling login or registration
            const userRepository = UserRepositoryImpl;
            const user = await googleLogin(userRepository, googleUser);

            res.status(200).json({
                message: 'Login successful',
                user,
            });

        }catch (error : any) {
            res.status(400).json({ error: error.message });
        }
    },

     forgotPassword :async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;
    
            if (!email) {
                res.status(400).json({ message: 'Email is required' });
                return;
            }
            await sendResetLink(email);
    
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

            await resetUserPassword(token, newPassword);

            res.status(200).json({ message: 'Password reset successfully' });
        } catch (error: any) {
            console.error('Error in resetPassword:', error.message);
            res.status(500).json({ message: error.message });
        }
    },
};