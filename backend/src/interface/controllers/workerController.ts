import { Request, Response } from 'express';
import { Worker } from '../../domain/entities/worker';
import { WorkerRepositoryImpl } from '../../infrastructure/database/repositories/WorkerRepositoryImpl';
import { generateOtp } from '../../application/useCases/generateOtp';
import { registerWorker } from '../../application/useCases/registerWorker';
import { validateOtp } from '../../application/useCases/validateOTP';
import { loginWorker } from '../../application/useCases/loginWorker';
import { resetPassword, sendResetLink } from "../../application/useCases/passwordResent";
import { validateToken } from "../../application/useCases/passwordResent";



export const workerController  = {
    signupWorker: async (req :Request , res: Response) =>{
       try{
       const worker = await registerWorker(WorkerRepositoryImpl , req.body);
       console.log("worker email" , worker.email)
       await generateOtp(worker.email , 0);
       res.status(200).json({message: " worker OTP send to your email"})

       }catch (error : any) {
          res.status(400).json({message: error.message})
       }

    },
    validateOtp : async (req: Request , res:Response) => {
        console.log("otp body",req.body)
        try{
          console.log(req.body.email)
          const { accessToken, refreshToken, role, valid } = await validateOtp(req.body.email, req.body.otp, 0);

        // Set tokens in cookies
        res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
        res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

        // Send tokens and role in the response
        res.status(200).json({
            message: 'OTP verified Successfully. You can Log in',
            valid,
            role,
            accessToken,
            refreshToken
    
        });
        }catch (error:any) {
            console.error("Error verifying OTP:", error.message);
           res.status(400).json({ message: error.message})
        }
    },
     login : async (req: Request, res: Response) => {
        try {
          
            const { accessToken, refreshToken } = await loginWorker(WorkerRepositoryImpl, req.body.email, req.body.password);
            
           
            res.cookie('access_token', accessToken, { httpOnly: true, maxAge: 86400000 }); // 1 day
    
          
            res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 604800000 }); // 7 days
    
            res.status(200).json({
                message: "You can now log in",
                accessToken,
                refreshToken,
            });
        }catch(error:any) {
            res.status(400).json({message:error.message})
        }
    },
    resendOtp: async (req: Request, res: Response) => {
        console.log("body" ,req.body)
        const { email } = req.body;
        try {
            await generateOtp(email ,0);
            res.status(200).json({ message: 'OTP resent to your email' });
        } catch (error: any) {
            console.error('Error sending OTP:', error); 
            res.status(400).json({ message: error.message || 'Failed to resend OTP' });
        }
    },

     forgotPassword :async (req: Request, res: Response): Promise<void> => {
            try {
                const { email } = req.body;
                console.log("email", email)
        
                if (!email) {
                    res.status(400).json({ message: 'Email is required' });
                    return;
                }
                await sendResetLink(email , 0);
        
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
           
}