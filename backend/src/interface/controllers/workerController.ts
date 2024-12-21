import { Request, Response } from 'express';
import { Worker, WorkerUpdates } from '../../domain/entities/worker';
import { WorkerRepositoryImpl } from '../../infrastructure/database/repositories/WorkerRepositoryImpl';
import { generateOtp } from '../../application/useCases/generateOtp';
import { registerWorker } from '../../application/useCases/registerWorker';
import { validateOtp } from '../../application/useCases/validateOTP';
import { loginWorker } from '../../application/useCases/loginWorker';
import { resetPassword, sendResetLink } from "../../application/useCases/passwordResent";
import { validateToken } from "../../application/useCases/passwordResent";
import { upadteAddress, userAddress } from '../../application/useCases/user/updateAddress';
import { workerProfile } from '../../application/useCases/worker/workerProfil';
import { uploadProfilePic } from '../../utils/s3Servise';
import { updateWorkerProfile } from '../../application/useCases/worker/updateWorkerProfile';
import { Availability } from '../../domain/entities/Availability';
import { availableSlots, createAvailability } from '../../application/useCases/worker/availability';
import { AvailabilityRepositoryImpl } from '../../infrastructure/database/repositories/AvailabilityRepositoryIml';
import AvailabilityModel from '../../infrastructure/database/models/availabilityModel';
import moment from 'moment';


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
          
            const { accessToken, refreshToken , workerId} = await loginWorker(WorkerRepositoryImpl, req.body.email, req.body.password);
            
           
            res.cookie('auth_token', accessToken, { httpOnly: true, maxAge: 86400000 }); // 1 day
    
          
            res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 604800000 }); // 7 days
    
            res.status(200).json({
                message: "You can now log in",
                accessToken,
                refreshToken,
                workerId
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

            getWorkerProfile: async (req: Request, res: Response) => {
                console.log("Request User:", req.user);
                try {
                    const workerEmail = (req.user as { email?: string })?.email;
                    if (!workerEmail) {
                        res.status(404).json({ error: 'Worker email not found in request' });
                        return;
                    }
            
                    const worker = await workerProfile(workerEmail);
                    const addressResponse = await userAddress(worker._id)
                    console.log("Address worker:", addressResponse, "Worker:", worker);
            
                    const { _id: workerId, name, email, phone, profilePic, expirience, status, skills } = worker;
                    // const parsedSkills = Array.isArray(skills) ? skills : JSON.parse(skills || '[]');
                    if (!addressResponse.address) {
                        res.status(200).json({
                            worker: {
                                _id: workerId,
                                name,
                                email,
                                phone,
                                profilePic,
                                skills:skills,
                                status,
                                expirience,
                            },
                            address: null,
                        });
                        return;
                    }
            
                    const { id: addressId, userId: addressuserId, address: useraddress, area } = addressResponse.address;
                    res.status(200).json({
                        worker: { _id: workerId, name, email, phone, expirience, skills, profilePic, status },
                        address: { id: addressId, userId: addressuserId, address: useraddress, area }
                    });
                } catch (error) {
                    console.error('Error retrieving user profile:', error);
                    res.status(500).json({ error: 'Internal server error' });
                }
            },

        
            updateWorkerProfile: async (req: Request, res: Response): Promise<void> => {
                console.log("Edit Request User:", req.user);
            
                try {
                    const workerEmail = (req.user as { email?: string })?.email;
                    if (!workerEmail) {
                        res.status(404).json({ error: 'Worker email not found in request' });
                        return;
                    }
            
                    const worker = await workerProfile(workerEmail);
                    if (!worker) {
                        res.status(404).json({ error: "Worker not found" });
                        return;
                    }
            
                    const { name, skills, expirience, status, address, area } = req.body;
            
            //         const skillArray = Array.isArray(skills) 
            // ? skills 
            // : typeof skills === 'string' 
            // ? skills.split(',').map(skill => skill.trim()) // Split string and trim spaces
            // : []; // Default to an empty array if not a string or array

                    let profilePicUrl: string | undefined;
                    if (req.file) {
                        profilePicUrl = await uploadProfilePic(req.file, worker.profilePic);
                    }
                    // console.log("Skills to be stored:...............................", skillArray);
            
                    const updates: Partial<any> = {
                        name,
                        skills:JSON.parse(skills), // Store as an array
                        expirience,
                        status,
                        ...(profilePicUrl && { profilePic: profilePicUrl }),
                    };
            
                    const updatedWorker = await updateWorkerProfile(worker.email, updates);
                    const workerAddress = await upadteAddress(worker._id.toString(), address, area);
            
                    res.status(200).json({ worker: updatedWorker, address: workerAddress });
                } catch (error) {
                    console.error('Error updating worker profile:', error);
                    res.status(500).json({ error: 'Failed to update worker profile' });
                }
            },
             handleCreateAvailability : async (req: Request, res: Response): Promise<void> => {
                console.log("availability", req.body)
                const { date, slots } = req.body;
            
                // Ensure date and slots are provided and valid
                if (!date || !Array.isArray(slots) || slots.length === 0) {
                    res.status(400).json({ message: 'Date and slots are required' });
                    return;
                }
            
                // Extract workerId from req.user
                const workerEmail = (req.user as { email?: string })?.email; // Assuming req.user has been set up correctly in your middleware
                if (!workerEmail) {
                    res.status(403).json({ message: 'Unauthorized: Worker ID not found' });
                    return; // Early return if workerId is not found
                }
                const worker = await workerProfile(workerEmail);

                const workerId = worker._id
                console.log("workerId" , workerId)
                if (!workerId) {
                    res.status(403).json({ message: 'Unauthorized: Worker ID not found' });
                    return; // Early return if workerId is not found
                }
            
                try {
                    // Call the use case to create the availability
                    const availability = await createAvailability(AvailabilityRepositoryImpl, workerId, new Date(date), slots);
            
                    // Send the created availability in the response
                    res.status(201).json(availability);
                } catch (error: any) {
                    console.error("Error creating availability:", error.message);
            
                    // Send an error response
                    res.status(500).json({ message: error.message });
                }
            },
            
            
            


            fetchAvailabilitySlotForWorker : async(req:Request , res :Response): Promise<void> => {
             const workerId = req.params.workerId
             try {
                // Call the use case function to fetch available slots for the worker
                const availabilities = await availableSlots(AvailabilityRepositoryImpl, workerId);
        
                // If no availabilities are found, respond with a message
                if (!availabilities || availabilities.length === 0) {
                    res.status(200).json({ message: "No slots available." });
                    return;
                }
        
                // If availabilities are found, respond with the data
                res.status(200).json(availabilities);
            } catch (error: any) {
                console.error("Error fetching available slots:", error);
                // Respond with an error message
                res.status(500).json({ message: "An error occurred while fetching available slots.", error: error.message });
            }
    }

}
