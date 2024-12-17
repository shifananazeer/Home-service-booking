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

import jwt from 'jsonwebtoken'

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
        console.log('Login request received:', req.body);
        try {
            const { accessToken, refreshToken }= await loginUser(
            UserRepositoryImpl,
            req.body.email,
            req.body.password
          );
          console.log('Tokens generated:', { accessToken, refreshToken });
          res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
          res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
          res.status(200).json({ accessToken, refreshToken });
        } catch (error: any) {
          res.status(400).json({ message: error.message });
        }
      },
    validateOtp: async (req: Request, res: Response) => {
        try {
            const { accessToken, refreshToken, role, valid } = await validateOtp(req.body.email, req.body.otp, 1);

        // Set tokens in cookies
        res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
        res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
        res.status(200).json({
            message: 'OTP verified Successfully. You can Log in',
            valid,
            role,
            accessToken,
            refreshToken
        });
        } catch (error: any) {
            console.error("Error verifying OTP:", error.message);
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
    },
    refreshAccessToken : async (req:Request , res: Response) => {
        try{
         const refreshToken = req.cookies.refresh_token;
         if(!refreshToken) throw new Error ('Refresh Token not provided');

         const decoded : any = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
         )

         const newAccessToken = jwt.sign(
            {email: decoded.email , role: "user"},
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn :"15m"}
         )
         res.cookie('auth_token', newAccessToken , {httpOnly:true , maxAge:15 * 60 * 1000 })
         res.status(200).json({ message: "Access token refreshed." });
        }catch (error) {
            res.status(401).json({ message: "Invalid Refresh Token" });
        }
    }
};

