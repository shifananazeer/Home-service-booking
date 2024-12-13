import { Request, Response } from 'express';
import { Worker } from '../../domain/entities/worker';
import { WorkerRepositoryImpl } from '../../infrastructure/database/repositories/WorkerRepositoryImpl';
import { generateOtp } from '../../application/useCases/generateOtp';
import { registerWorker } from '../../application/useCases/registerWorker';
import { validateOtp } from '../../application/useCases/validateOTP';
import { loginWorker } from '../../application/useCases/loginWorker';

export const workerController  = {
    signupWorker: async (req :Request , res: Response) =>{
       try{
       const worker = await registerWorker(WorkerRepositoryImpl , req.body);
       console.log("worker email" , worker.email)
       await generateOtp(worker.email);
       res.status(200).json({message: " worker OTP send to your email"})

       }catch (error : any) {
          res.status(400).json({message: error.message})
       }

    },
    validateOtp : async (req: Request , res:Response) => {
        console.log("otp body",req.body)
        try{
          console.log(req.body.email)
          const token = await validateOtp (req.body.email, req.body.otp) ;
          res.cookie('auth_token', token , {httpOnly:true, maxAge:8400000});
          res.status(200).json({ message: 'OTP verified Successfully. You can Log in ', token})
        }catch (error:any) {
           res.status(400).json({ message: error.message})
        }
    },
    login: async(req:Request , res:Response) => {
        try{
            const token = await loginWorker(WorkerRepositoryImpl,req.body.email , req.body.password)
            res.cookie('auth_token', token, {httpOnly:true , maxAge: 86400000});
            res.status(200).json({message:" You can Now log in ", token});
        }catch(error:any) {
            res.status(400).json({message:error.message})
        }
    }
}