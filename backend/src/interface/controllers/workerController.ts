import { Request, Response } from 'express';
import { Worker, WorkerUpdates } from '../../domain/entities/worker';
import { WorkerRepositoryImpl } from '../../infrastructure/database/repositories/WorkerRepositoryImpl';
import { generateOtp } from '../../application/useCases/generateOtp';
import {  WorkerService } from '../../application/useCases/workerService';
import { validateOtp } from '../../application/useCases/validateOTP';

import { resetPassword, sendResetLink } from "../../application/useCases/passwordResent";
import { validateToken } from "../../application/useCases/passwordResent";
import { AddressService} from '../../application/useCases/addressService';

import { uploadProfilePic } from '../../utils/s3Servise';
import { Availability } from '../../domain/entities/Availability';
import { AvailabilityService, } from '../../application/useCases/availabilityService';
import { AvailabilityRepositoryImpl } from '../../infrastructure/database/repositories/AvailabilityRepositoryIml';
import AvailabilityModel from '../../infrastructure/database/models/availabilityModel';
import moment from 'moment';
import { getServers } from 'dns';
import { ServiceRepositoryImpl } from '../../infrastructure/database/repositories/ServiceRepositoryIml';
import { BookingService, singleWorker } from '../../application/useCases/bookingService';
import { AddressRepositoryImpl } from '../../infrastructure/database/repositories/AddressRepositoryIml';
import { getAllServicesUseCase } from '../../application/useCases/getAllService';
import { HttpStatus } from '../../utils/httpStatus';
import { Messages } from '../../utils/message';
import { refreshAccessToken } from '../../application/useCases/refreshAccessToken';
import { ChatService } from '../../application/useCases/chatService';
import { getIo } from '../../infrastructure/sockets/chatSocket';
import { uploadChatImage } from '../../utils/uploadChatImage';
import { NotificationService } from '../../application/useCases/notificationService';

const workerService = new WorkerService();
const addressService = new AddressService();
const availabilityService = new AvailabilityService();
const bookingService = new BookingService();
const chatService = new ChatService()
const notificationService = new NotificationService()

class WorkerController   {
 async signupWorker(req :Request , res: Response):Promise<void> {
       try{
       const worker = await workerService.registerWorker( req.body);
       console.log("worker email" , worker.email)
       await generateOtp(worker.email , 0);
       res.status(HttpStatus.OK).json({message: Messages.OTP_SEND})

       }catch (error : any) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: error.message})
       }

    }

   async validateOtp   (req: Request , res:Response) {
        try{
          console.log(req.body.email)
          const { accessToken, refreshToken, role, valid , userId} = await validateOtp(req.body.email, req.body.otp, 0);
        res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
        res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

        // Send tokens and role in the response
        res.status(HttpStatus.OK).json({
            message: Messages.OTP_VERIFIED,
            valid,
            role,
            accessToken,
            refreshToken, 
            userId
    
        });
        }catch (error:any) {
            console.error("Error verifying OTP:", error.message);
           res.status(HttpStatus.BAD_REQUEST).json({ message: error.message})
        }
    }

   async  login  (req: Request, res: Response) {
        try {
            const { accessToken, refreshToken , workerId} = await workerService.loginWorker( req.body.email, req.body.password);
            res.cookie('auth_token', accessToken, { httpOnly: true, maxAge: 86400000 }); // 1 day
            res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 604800000 }); // 7 days
            res.status(HttpStatus.OK).json({
                message: Messages.LOGIN,
                accessToken,
                refreshToken,
                workerId
            });
        }catch(error:any) {
            res.status(HttpStatus.BAD_REQUEST).json({message:error.message})
        }
    }
   async resendOtp (req: Request, res: Response){
        console.log("body" ,req.body)
        const { email } = req.body;
        try {
            await generateOtp(email ,0);
            res.status(HttpStatus.OK).json({ message: Messages.RESEND});
        } catch (error: any) {
            console.error('Error sending OTP:', error); 
            res.status(HttpStatus.BAD_REQUEST).json({ message: error.message || 'Failed to resend OTP' });
        }
    }

   async  forgotPassword (req: Request, res: Response): Promise<void> {
            try {
                const { email } = req.body;
                console.log("email", email)
                if (!email) {
                    res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.EMAIL_REQUIRED});
                    return;
                }
                await sendResetLink(email , 0);
                res.status(HttpStatus.OK).json({ message: Messages.PASSWORD_RESET_LINK_SEND });
            } catch (error: any) {
                console.error('Error in forgotPassword:', error.message);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.INTERNAL_SERVER_ERROR });
            }
        }

     async validateResetToken (req: Request, res: Response): Promise<void> {
                try {
                    const { token } = req.params;
        
                    const isValid = await validateToken(token);
                    if (!isValid) {
                        res.status(HttpStatus.BAD_REQUEST).json({ message:Messages.NOT_VALID });
                        return;
                    }
        
                    res.status(HttpStatus.OK).json({ message: Messages.VALID });
                } catch (error: any) {
                    console.error('Error in validateResetToken:', error.message);
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
                }
            }
        
           async resetPassword (req: Request, res: Response): Promise<void> {
                console.log("body",req.body)
                try {
                    const { token, newPassword } = req.body;
        
                    await resetPassword(token, newPassword);
        
                    res.status(HttpStatus.OK).json({ message: Messages.RESET_PASSWORD_SUCCESS });
                } catch (error: any) {
                    console.error('Error in resetPassword:', error.message);
                    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
                }
            }
          
              async refreshAccessToken (req: Request, res: Response): Promise<void>  {
                     const { refreshToken } = req.body;
                 
                     if (!refreshToken) {
                         res.status(HttpStatus.BAD_REQUEST).json({ error: Messages.REFRESHTOKEN_REQUIRED });
                         return;
                     }
                     try {
                         const type = 'worker'
                         const accessToken = await refreshAccessToken(refreshToken , type);
                         res.status(HttpStatus.OK).json({ accessToken });
                     } catch (error: any) {
                         console.error("Error refreshing access token:", error.message);
                         if (error.name === "TokenExpiredError") {
                             res.status(HttpStatus.UNAUTHORIZED).json({ error: Messages.REFRESHTOKEN_EXPIRED });
                         } else if (error.name === "JsonWebTokenError") {
                             res.status(HttpStatus.UNAUTHORIZED).json({ error: Messages.INVALID_REFRESHTOKEN });
                         } else {
                             res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message ||Messages.INTERNAL_SERVER_ERROR });
                         }
                     }
                 }

        

          async  getWorkerProfile (req: Request, res: Response)  {
                console.log("Request User:", req.user);
                try {
                    const workerEmail = (req.user as { email?: string })?.email;
                    if (!workerEmail) {
                        res.status(HttpStatus.NOT_FOUND).json({ error: Messages.EMAIL_NOT_FOUNT });
                        return;
                    }
            
                    const worker = await workerService.workerProfile(workerEmail);
                    const addressResponse = await addressService.userAddress(worker._id)
                    console.log("Address worker:", addressResponse, "Worker:", worker);
            
                    const { _id: workerId, name, email, phone, profilePic, expirience, status, skills , hourlyRate } = worker;
                  
                    if (!addressResponse.address) {
                        res.status(HttpStatus.OK).json({
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
                    res.status(HttpStatus.OK).json({
                        worker: { _id: workerId, name, email, phone, expirience, skills, profilePic, hourlyRate ,status },
                        address: { id: addressId, userId: addressuserId, address: useraddress, area }
                    });
                } catch (error) {
                    console.error('Error retrieving user profile:', error);
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: Messages.INTERNAL_SERVER_ERROR});
                }
            }

           async updateWorkerProfile (req: Request, res: Response): Promise<void>  {
                console.log("Edit Request User:", req.user);
            
                try {
                    const workerEmail = (req.user as { email?: string })?.email;
                    console.log("wemeil", workerEmail)
                    if (!workerEmail) {
                        res.status(HttpStatus.NOT_FOUND).json({ error: Messages.EMAIL_NOT_FOUNT });
                        return;
                    }
            
                    const worker = await workerService.workerProfile(workerEmail);
                    console.log("workerrr",worker)
                    if (!worker) {
                        res.status(HttpStatus.NOT_FOUND).json({ error: Messages.NOT_FOUNT });
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
            
                    const updatedWorker = await workerService.updateWorkerProfile(worker.email, updates);
                    const workerAddress = await addressService.updateAddress(worker._id.toString(), address, area);
            
                    res.status(HttpStatus.OK).json({ worker: updatedWorker, address: workerAddress });
                } catch (error) {
                    console.error('Error updating worker profile:', error);
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: Messages.FAILED_UPDATE });
                }
            }

          async  handleCreateAvailability (req: Request, res: Response): Promise<void> {
                console.log("availability", req.body);
                const { date, slots } = req.body;
            
                if (!date || !Array.isArray(slots) || slots.length === 0) {
                    res.status(400).json({ message: Messages.DATE_SLOT_REQUIRED });
                    return;
                }
            
                const parsedDate = new Date(date);
                const utcDate = new Date(parsedDate.toUTCString());
                const workerEmail = (req.user as { email?: string })?.email;
            
                if (!workerEmail) {
                    res.status(HttpStatus.FORBIDDEN).json({ message: Messages.UNAUTHORIZED });
                    return;
                }
            
                try {
                    const worker = await workerService.workerProfile(workerEmail);
                    const workerId = worker._id;
            
                    if (!workerId) {
                        res.status(HttpStatus.FORBIDDEN).json({ message: Messages.UNAUTHORIZED });
                        return;
                    }
            
                    const availability = await availabilityService.createAvailability(workerId, utcDate, slots);
            
                    res.status(HttpStatus.CREATED).json(availability);
                } catch (error: any) {
                    console.error("Error creating availability:", error.message);
            
                    // Handle specific error for duplicate slots
                    if (error.message.includes("Conflicting slot")) {
                        res.status(HttpStatus.CONFLICT).json({ message: error.message });
                    } else {
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
                    }
                }
            }

          async  fetchAvailabilitySlotForWorker (req:Request , res :Response): Promise<void> {
                const workerId = req.params.workerId;
                const page = parseInt(req.query.page as string) || 1;
                const limit = parseInt(req.query.limit as string) || 5;
            
                console.log("page", page);
                console.log("limit", limit);
            
                try {
                    if (page <= 0 || limit <= 0) {
                        res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.INVALIED_PAGINATION });
                        return;
                    }
            
                    const result = await availabilityService.availableSlotsUseCase(workerId, page, limit);
            
                    if (!result.availabilities || result.availabilities.length === 0) {
                        res.status(HttpStatus.OK).json({ message: Messages.NO_SLOTS });
                        return;
                    }
            
                    res.status(HttpStatus.OK).json({
                        data: result.availabilities,
                        pagination: result.pagination,
                    });
                } catch (error: any) {
                    console.error("Error fetching available slots:", error);
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        message: Messages.ERROR_FETCHING,
                        error: error.message,
                    });
                }
    }

   async editAvailabilitySlot (req:Request , res:Response):Promise<void> {
        const slotId = req.params.slotId;
        const { startTime, endTime, isAvailable } = req.body; 
        try {
            const updatedSlot = await availabilityService.updateSlot(slotId, { startTime, endTime, isAvailable });
             res.status(HttpStatus.OK).json({
                message: Messages.SLOT_UPDATED,
                slot: updatedSlot,
            });
            return;
        } catch (error:any) {
             res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
             return;
        }
    }

  async  deleteAvailabilitySlot (req:Request , res:Response) : Promise<void> {
        const { slotId } = req.params; 
        try {
            const result = await availabilityService.deleteSlot(slotId);
    
         
                res.status(HttpStatus.OK).json({ message: Messages.SLOT_DELETED });
                return
          
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: Messages.FAILED_DELETE });
            return
        }
    }

   async blockWorker (req:Request , res:Response): Promise<void> {
        const { workerId } = req.params;
        try{
            const updateWorker = await workerService.blockWorker(workerId);
            if (!updateWorker) {
                res.status(HttpStatus.NOT_FOUND).json({ message: Messages.NOT_FOUNT });
                return;
            }
            res.json({ message: 'User blocked successfully', worker: updateWorker });
        } catch (error) {
            console.error('Error blocking user:', error);
            res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR });
        }
        }

       async  unblockWorker  (req: Request, res: Response): Promise<void>  {
                const { workerId } = req.params;
            
                try {
                    const updatedWorker = await workerService.unblockWorker(workerId);
                    if (!updatedWorker) {
                        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.NOT_FOUNT });
                        return;
                    }
                    res.json({ message: Messages.BLOCKED_SUCCESSFULLY, worker: updatedWorker });
                } catch (error) {
                    console.error('Error unblocking user:', error);
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.INTERNAL_SERVER_ERROR });
                }
            }

          async  getServices (req: Request, res: Response): Promise<void>  {
                console.log("Fetching all services...");
                try {
                    const result = await getAllServicesUseCase();
                    res.status(HttpStatus.OK).json(result);
                } catch (error: any) {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages.SERVICE_FETCH_FAILED,
                        error: error.message,
                    });
                }
            }
    

         async findWorkerBySkills (req: Request, res: Response): Promise<void>  {
                const skill = req.query.skill as string; 
            
                try {
                    const workers = await workerService.findWorkersBySkill(skill);
                    console.log("fetchWorkers",workers)
                    res.status(HttpStatus.OK).json({ workers });
                } catch (error: any) {
                    console.error(error);
                    if (error.message === 'Skill is required') {
                        res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
                    } else if (error.message === Messages.WORKER_BY_SKILL ) {
                        res.status(404).json({ message: error.message });
                    } else {
                        res.status(500).json({ error: Messages.ERROR_FETCHING });
                    }
                }
            }

         async updateLocation (req:Request , res:Response) : Promise<void>  {
            const { latitude, longitude, workerId } = req.body;

            try {
                const result = await addressService.updateLocation(workerId, latitude, longitude);
                
                if (!result.success) {
                    res.status(HttpStatus.NOT_FOUND).json({ message: result.message });
                    return;
                }
                
                res.status(HttpStatus.OK).json({ message: result.message, data: result.updatedAddress });
            } catch (error: any) {
                console.error("Error updating coordinates:", error);
                res.status(HttpStatus.OK).json({ message:Messages.FAIL_UPDATE_COORDINATES , error: error.message });
            }
          }  
       async  allBookingsByworkerId (req:Request , res:Response) :Promise<void> {
            const { page, limit } = req.query;
              const workerId = req.params.workerId;

            console.log("Page:", page, "Limit:", limit, "Worker ID:", workerId);
            try {

                const parsedPage = parseInt(page as string, 10)||1;
                const parsedLimit = parseInt(limit as string, 10)||1;
                const result = await bookingService.getBookingsByWorkerId(workerId, parsedPage, parsedLimit);
                if (!result.bookings || result.bookings.length === 0) {
                    res.status(HttpStatus.NOT_FOUND).json({ message:Messages.NOT_FOUNT });
                    return;
                }
              console.log("result" , result)
         
                res.status(HttpStatus.OK).json(result);
            } catch (error) {
                console.error('Error in getWorkerBookingsController:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.INTERNAL_SERVER_ERROR });
            }
          }

          async getWorkerLocation (req: Request, res: Response): Promise<void>  {
            const { workerId } = req.params;
        
            try {
                const response = await singleWorker(workerId);
        
                if (!response.address) {
                    res.status(HttpStatus.NOT_FOUND).json({ message: response.message });
                    return;
                }
        
                res.status(HttpStatus.OK).json(response);
            } catch (error) {
                console.error('Error in getWorkerLocation:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.INTERNAL_SERVER_ERROR });
            }
        }

      async todaysBooking  (req:Request , res:Response) : Promise<void>  {
            try {
                const workerId = req.params.workerId as string; 
                if (!workerId) {
              
                  res.status(HttpStatus.BAD_REQUEST).json({ message:Messages.WORKERID_REQUIRED  });
                  return 
                }
            
                const bookings = await bookingService.fetchTodaysBookings(workerId);
            
              res.status(HttpStatus.OK).json({ bookings });
              return
              } catch (error) {
                console.error(error);
              res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.ERROR_FETCHING, error });
              return 
              }
            }

            async handleSendMessage(req: Request, res: Response) {
                console.log("body", req.file);
                const { chatId, senderId, senderModel, text } = req.body;
            
                if (!chatId || !senderId || !senderModel || !text) {
                    res.status(HttpStatus.BAD_REQUEST).json({ message: "All fields are required." });
                }
            
                let mediaUrl: string | undefined;
            
                // Upload the image if it exists
                if (req.file) {
                    try {
                        mediaUrl = await uploadChatImage(req.file);
                    } catch (error) {
                         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error uploading image.", error });
                    }
                }
            
                try {
                    // Pass mediaUrl to the sendMessage method
                    const message = await chatService.sendMessage(chatId, senderId, senderModel, text, mediaUrl);
                    
                    const io = getIo();
                    io.to(chatId).emit('newMessage', message);
                    
                    res.status(200).json(message);
                } catch (error) {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.INTERNAL_SERVER_ERROR, error });
                }
            }
                    async handleGetMessage (req:Request , res:Response) {
                        const { chatId } = req.params;
                        try{
                            const messages = await chatService.getMessages(chatId);
                            res.status(HttpStatus.OK).json(messages);
                        }catch (error) {
                            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching messages", error });
                        }
                    }
            
                    async handleCreateOrfetchChat (req:Request , res:Response) {
                        const { userId, workerId } = req.body;
                        try {
                            const chat = await chatService.createOrFetchChat(userId, workerId);
                            res.status(HttpStatus.OK).json(chat);
                          } catch (error) {
                            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error creating or fetching chat", error });
                          }
                    }

                    async getMessages (req:Request , res:Response) {
                        console.log('getMessages called'); // Check if the function is hit
                        const workerId = req.params.workerId;
                    
                        try {
                            const chats = await chatService.getChatForWorker(workerId);
                            console.log('Chats for workerId:', workerId, '->', chats);
                    
                            if (chats.length === 0) {
                                 res.status(404).json({ message: 'No chats found for this worker.' });
                            }
                    
                            res.status(200).json(chats);
                        } catch (error: any) {
                            console.error('Error fetching chats:', error); // Log error for debugging
                            res.status(500).json({ message: 'Error fetching chats', error: error.message });
                        }
                    }
               async addReaction (req:Request , res:Response) {
                console.log(req.body);
                const { messageId } = req.params;
                const { emoji } = req.body;
                console.log("Message ID:", messageId, "Emoji:", emoji)
              
                const userModel= 'worker';

                if (!messageId || !emoji) {
                    res.status(400).json({ error: "Message ID and emoji are required." });
                    return;
                  }
                  try {
                    console.log("Adding reaction:", { messageId, emoji });
                    const reaction = await chatService.updateReaction(messageId, emoji, userModel);
                    res.status(200).json(reaction);
                } catch (error: any) {
                    console.error("Error adding reaction:", error); // Log the full error
                    res.status(500).json({ error: error.message });
                }
               }
               async getUnreadNotification (req:Request , res:Response) {
                const { workerId } = req.params
                console.log("worId" , workerId)
                try{
                  const unreadMessage = await chatService.getUnreadMessage(workerId);
                  console.log("unread" , unreadMessage)
                  res.status(200).json(unreadMessage);
                }catch(error) {

                }
               }

               async updateWorkStatus (req:Request , res:Response):Promise<void> {
                const { bookingId } = req.body;
                try{
                    const updateStatus = await bookingService.workeStatusUpdate(bookingId)
                    console.log("updateWorkStatus:" , updateStatus)
                    if (!updateStatus?.userId) {
                        throw new Error("userId is required to create a notification");
                    }
                    const notificationData={
                        userId: typeof updateStatus?.userId === "string" ? updateStatus.userId : updateStatus?.userId.toString(),
                        userType: 'user' as 'user' | 'worker',
                       message:'The worker marked your task as completed.'
                    

                    }
                    const notification = await notificationService.saveNotification(notificationData)
                    res.status(HttpStatus.OK).json({ message: "Work status updated and notification sent." });
                }catch(error:any) {
                    console.error('Error marking booking as completed:', error);
                     res.status(500).json({ message: 'Failed to mark booking as completed', error: error.message });
                     return
                }
               }
    }

    export const workerController  = new WorkerController();


