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
import { availableSlots, createAvailability, deleteSlot, updateSlot } from '../../application/useCases/worker/availability';
import { AvailabilityRepositoryImpl } from '../../infrastructure/database/repositories/AvailabilityRepositoryIml';
import AvailabilityModel from '../../infrastructure/database/models/availabilityModel';
import moment from 'moment';
import { blockWorker, unblockWorker } from '../../application/useCases/worker/blockWorker';
import { getServers } from 'dns';
import { ServiceRepositoryImpl } from '../../infrastructure/database/repositories/ServiceRepositoryIml';
import { workerService } from '../../application/useCases/worker/workerService';
import { AddressRepositoryImpl } from '../../infrastructure/database/repositories/AddressRepositoryIml';


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
          const { accessToken, refreshToken, role, valid , userId} = await validateOtp(req.body.email, req.body.otp, 0);

        // Set tokens in cookies
        res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
        res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

        // Send tokens and role in the response
        res.status(200).json({
            message: 'OTP verified Successfully. You can Log in',
            valid,
            role,
            accessToken,
            refreshToken, 
            userId
    
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
            
                    const { _id: workerId, name, email, phone, profilePic, expirience, status, skills , hourlyRate } = worker;
                  
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
                                hourlyRate,
                            },
                            address: null,
                        });
                        return;
                    }
            
                    const { id: addressId, userId: addressuserId, address: useraddress, area } = addressResponse.address;
                    res.status(200).json({
                        worker: { _id: workerId, name, email, phone, expirience, skills, profilePic, hourlyRate ,status },
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
            
                    const { name, skills, expirience, status,hourlyRate , address, area } = req.body;
            
            
                    let profilePicUrl: string | undefined;
                    if (req.file) {
                        profilePicUrl = await uploadProfilePic(req.file, worker.profilePic);
                    }
                    // console.log("Skills to be stored:...............................", skillArray);
            
                    const updates: Partial<any> = {
                        name,
                        skills:JSON.parse(skills), 
                        expirience,
                        status,
                        hourlyRate,
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
                if (!date || !Array.isArray(slots) || slots.length === 0) {
                    res.status(400).json({ message: 'Date and slots are required' });
                    return;
                }
                const parsedDate = new Date(date);
                const utcDate = new Date(parsedDate.toUTCString());
                const workerEmail = (req.user as { email?: string })?.email; 
                if (!workerEmail) {
                    res.status(403).json({ message: 'Unauthorized: Worker ID not found' });
                    return; 
                }
                const worker = await workerProfile(workerEmail);
                const workerId = worker._id
                console.log("workerId" , workerId)
                if (!workerId) {
                    res.status(403).json({ message: 'Unauthorized: Worker ID not found' });
                    return; 
                }
                try {
                    const availability = await createAvailability(AvailabilityRepositoryImpl, workerId,utcDate, slots);
                    res.status(201).json(availability);
                } catch (error: any) {
                    console.error("Error creating availability:", error.message);
                    res.status(500).json({ message: error.message });
                }
            },

            fetchAvailabilitySlotForWorker : async(req:Request , res :Response): Promise<void> => {
             const workerId = req.params.workerId;
             const page = parseInt(req.query.page as string) || 1;
             const limit = parseInt(req.query.limit as string) || 5; 
             console.log("page" , page)
             console.log("limit" , limit)
             try {
                
                if (page <= 0 || limit <= 0) {
                    res.status(400).json({ message: "Invalid pagination parameters." });
                    return;
                }
                const availabilities = await availableSlots(AvailabilityRepositoryImpl, workerId, page, limit);
                if (!availabilities || availabilities.length === 0) {
                    res.status(200).json({ message: "No slots available." });
                    return;
                }
                const totalCount = await AvailabilityRepositoryImpl.countAvailableSlots(workerId);
                res.status(200).json({
                    data: availabilities,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalCount / limit),
                        totalCount,
                    },
                });
            } catch (error: any) {
                console.error("Error fetching available slots:", error);
                res.status(500).json({ message: "An error occurred while fetching available slots.", error: error.message });
            }
    },

    editAvailabilitySlot: async (req:Request , res:Response):Promise<void> => {
        const slotId = req.params.slotId;
        const { startTime, endTime, isAvailable } = req.body; 
        try {
            const updatedSlot = await updateSlot(slotId, { startTime, endTime, isAvailable }, AvailabilityRepositoryImpl);
             res.status(200).json({
                message: 'Slot updated successfully',
                slot: updatedSlot,
            });
            return;
        } catch (error:any) {
             res.status(404).json({ message: error.message });
             return;
        }
    },

    deleteAvailabilitySlot : async (req:Request , res:Response) : Promise<void> => {
        const { slotId } = req.params; 
        try {
            const result = await deleteSlot(slotId);
    
         
                res.status(200).json({ message: 'Slot deleted successfully' });
                return
          
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to delete slot' });
            return
        }
    },

    blockWorker : async (req:Request , res:Response): Promise<void> => {
        const { workerId } = req.params;
        try{
            const updateWorker = await blockWorker(workerId);
            if (!updateWorker) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.json({ message: 'User blocked successfully', worker: updateWorker });
        } catch (error) {
            console.error('Error blocking user:', error);
            res.status(500).json({ message: 'Server error' });
        }
        },

         unblockWorker : async (req: Request, res: Response): Promise<void> => {
                const { workerId } = req.params;
            
                try {
                    const updatedWorker = await unblockWorker(workerId);
                    if (!updatedWorker) {
                        res.status(404).json({ message: 'User not found' });
                        return;
                    }
                    res.json({ message: 'User unblocked successfully', worker: updatedWorker });
                } catch (error) {
                    console.error('Error unblocking user:', error);
                    res.status(500).json({ message: 'Server error' });
                }
            },

            getServices: async (req: Request, res: Response):Promise<void> => {
                console.log("Fetching all services...");
                try {
                    const services = await ServiceRepositoryImpl.getAllServices();
                    if (!services) { // Check for null
                         res.status(200).json({
                            success: true,
                            services: [],
                            message: 'No services found',
                        });
                        return
                    }
            
                    if (services.length === 0) { // Check for empty array
                         res.status(200).json({
                            success: true,
                            services: [],
                            message: 'No services available',
                            
                        });
                        return
                    }
                    res.status(200).json({ success: true, services });
                } catch (error: any) {
                    console.error('Error fetching services:', error.message);
                    res.status(500).json({
                        success: false,
                        message: 'Failed to fetch services',
                        error: error.message,
                    });
                }
            },

            findWorkerBySkills: async (req: Request, res: Response): Promise<void> => {
                const skill = req.query.skill as string; 
            
                try {
                    const workers = await workerService(skill);
                    console.log("fetchWorkers",workers)
                    res.status(200).json({ workers });
                } catch (error: any) {
                    console.error(error);
                    if (error.message === 'Skill is required') {
                        res.status(400).json({ error: error.message });
                    } else if (error.message === 'No workers found with this skill') {
                        res.status(404).json({ message: error.message });
                    } else {
                        res.status(500).json({ error: 'Failed to fetch workers' });
                    }
                }
            },

          updateLocation:async (req:Request , res:Response) : Promise<void> => {
            const { latitude, longitude ,workerId } = req.body;
           try{
            const response = await AddressRepositoryImpl.updateLocation(latitude , longitude ,workerId)
            if (!response) {
                res.status(404).json({ message: "Address not found for the given workerId." });
                return;
            }
            res.status(200).json({ message: "Coordinates updated successfully.", data: response });
            return
           }catch (error:any) {
            console.error("Error updating coordinates:", error);
            res.status(500).json({ message: "Failed to update coordinates in the database.", error: error.message });
            return
           }
          }  
    }



