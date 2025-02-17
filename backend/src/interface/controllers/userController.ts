import { NextFunction , Request , Response } from "express";
import {  UserService } from "../../application/useCases/userService";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { validateOtp } from "../../application/useCases/validateOTP";
import { generateOtp } from "../../application/useCases/generateOtp";
import { sendResetLink } from "../../application/useCases/passwordResent";
import { resetPassword } from "../../application/useCases/passwordResent";
import { validateToken } from "../../application/useCases/passwordResent";
import { v4 as uuidv4 } from 'uuid';
import {getIo} from '../../infrastructure/sockets/chatSocket'
import jwt from 'jsonwebtoken'
import { refreshAccessToken } from "../../application/useCases/refreshAccessToken";
import { uploadProfilePic } from "../../utils/s3Servise";
import { AddressService, updateAddress, updateLocation, userAddress } from "../../application/useCases/addressService";

import { AvailabilityService } from "../../application/useCases/availabilityService";
import { Booking } from "../../domain/entities/Booking";

import { AddressRepositoryImpl } from "../../infrastructure/database/repositories/AddressRepositoryIml";
import { HttpStatus } from "../../utils/httpStatus";
import { HttpRequest } from "aws-sdk";
import { Messages } from "../../utils/message";
import { BookingService } from "../../application/useCases/bookingService";
import { WorkerService } from "../../application/useCases/workerService";
import { ServiceManagement } from "../../application/useCases/servicesManagement";
import Stripe from "stripe";
import { PaymentService } from "../../application/useCases/paymentService";
import { ChatService } from "../../application/useCases/chatService";
import { uploadChatImage } from "../../utils/uploadChatImage";
import { NotificationService } from "../../application/useCases/notificationService";
import { Ratings } from "../../domain/entities/Rating";
import RatingsModel from "../../infrastructure/database/models/ratingsModel";
import { RatingService } from "../../application/useCases/ratingservice";
import { WalletService } from "../../application/useCases/walletService";
import { Types } from "mongoose";
import { generateInvoicePDF } from "../../infrastructure/services/invoice";
const addressRepository = new AddressRepositoryImpl();

const addressService = new AddressService();
const userService = new UserService();
const availabilityService = new AvailabilityService()
const bookingService = new BookingService();
const serviceManagement = new ServiceManagement();
const workerService = new WorkerService()
const paymentService = new PaymentService()
const chatService = new ChatService()
const notificationService = new NotificationService()
const ratingService = new RatingService()
const walletService = new WalletService()

class UserController  {
   async register (req: Request, res: Response) {
        console.log("body", req.body)
        try {
          const user = await userService.registerUser( req.body);
          await generateOtp(user.email,1);
          res
            .status(HttpStatus.OK)
            .json({ message: Messages.OTP_SEND });
        } catch (error: any) {
          res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        }
      }
   async login (req: Request, res: Response)  {
        console.log('Login request received:', req.body);
        try {
            const { accessToken, refreshToken ,userId  , userFirstName , userEmail , userRole} = await userService.loginUser(
                req.body.email,
                req.body.password
            );
            console.log('Tokens generated:', { accessToken, refreshToken });
    
            // Set cookies with tokens
            res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
            res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
            res.status(HttpStatus.OK).json({
                message: Messages.LOGIN,
                accessToken,
                refreshToken,
                userId,
                userFirstName , 
                userEmail ,
                userRole
            });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        }
      }
    async validateOtp (req: Request, res: Response)  {
        try {
            const { accessToken, refreshToken, role, valid  , userId} = await validateOtp(req.body.email, req.body.otp, 1);
        res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
        res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
        res.status(HttpStatus.OK).json({
            message: Messages.OTP_VERIFIED,
            valid,
            role,
            accessToken,
            refreshToken,
            userId,
        });
        } catch (error: any) {
            console.error("Error verifying OTP:", error.message);
            res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        }
    }
   async resendOtp (req: Request, res: Response)  {
        console.log("body" ,req.body)
        const { email } = req.body;
        try {
            await generateOtp(email ,1);
            res.status(HttpStatus.OK).json({ message:Messages.RESEND });
        } catch (error: any) {
            console.error('Error sending OTP:', error); 
            res.status(HttpStatus.BAD_REQUEST).json({ message: error.message || Messages.FAILED_RESEND });
        }
    }

    async forgotPassword  (req: Request, res: Response): Promise<void>  {
        try {
            const { email } = req.body;
    
            if (!email) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.EMAIL_REQUIRED });
                return;
            }
            await sendResetLink(email , 1);

            res.status(HttpStatus.OK).json({ message: Messages.PASSWORD_RESET_LINK_SEND });
        } catch (error: any) {
            console.error('Error in forgotPassword:', error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.INTERNAL_SERVER_ERROR });
        }
    }
    async validateResetToken (req: Request, res: Response): Promise<void>  {
        try {
            const { token } = req.params;

            const isValid = await validateToken(token);
            if (!isValid) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.NOT_VALID });
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
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
   
   async blockUser  (req: Request, res: Response): Promise<void> {
        const { userId } = req.params;
    
        try {
            const updatedUser = await userService.blockUser(userId);
            if (!updatedUser) {
                res.status(HttpStatus.NOT_FOUND).json({ message:Messages.NOT_FOUNT });
                return;
            }
            const io = getIo(); 
            io.emit('blockUser', userId);
            res.json({ message: Messages.BLOCKED_SUCCESSFULLY, user: updatedUser });
        } catch (error) {
            console.error('Error blocking user:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.INTERNAL_SERVER_ERROR });
        }
    }

   async unblockUser  (req: Request, res: Response): Promise<void>  {
        const { userId } = req.params;
    
        try {
            const updatedUser = await userService.unblockUser(userId);
            if (!updatedUser) {
                res.status(HttpStatus.NOT_FOUND).json({ message: 'User not found' });
                return;
            }
            res.json({ message: Messages.UNBLOCKED_SUCCESSFULLY, user: updatedUser });
        } catch (error) {
            console.error('Error unblocking user:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.INTERNAL_SERVER_ERROR });
        }
    }
    async refreshAccessToken (req: Request, res: Response): Promise<void>  {
        const { refreshToken } = req.body;
    
        if (!refreshToken) {
            res.status(HttpStatus.BAD_REQUEST).json({ error: Messages.REFRESHTOKEN_REQUIRED });
            return;
        }
        try {
            const type = 'user'
            const accessToken = await refreshAccessToken(refreshToken , type );
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
   async getUserProfile (req: Request, res: Response): Promise<void>  {
        console.log("Request User:", req.user); 
        try {
            const userEmail = (req.user as { email?: string })?.email;
            if (!userEmail) {
                res.status(HttpStatus.NOT_FOUND).json({ error: Messages.EMAIL_NOT_FOUNT });
                return; 
            }
            const user = await userService.userProfile(userEmail);
            if (!user) {
                throw new Error("User not found");
            }
            const addressResponse = await addressService.userAddress(user._id); 
            console.log("address.............", addressResponse, "user", user);
            if (!addressResponse.address) {
          
                res.status(HttpStatus.OK).json({
                    user: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        mobileNumber: user.mobileNumber,
                        profilePic: user.profilePic,
                    },
                    address: null,
                });
                return; 
            }
            const {
                _id: userId,
                firstName,
                lastName,
                email,
                mobileNumber,
                profilePic
            } = user;
            const {
                id: addressId,
                userId: addressUserId, 
                address: useraddress,
                area
            } = addressResponse.address; 
            res.status(HttpStatus.OK).json({
                user: {
                    _id: userId,
                    firstName,
                    lastName,
                    email,
                    mobileNumber,
                    profilePic
                },
                address: {
                    id: addressId,
                    userId: addressUserId,
                    address: useraddress,
                    area
                }
            });
        } catch (error) {
            console.error('Error retrieving user profile:', error); 
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: Messages.INTERNAL_SERVER_ERROR });
        }
    }

    async editProfile (req: Request, res: Response)  {
        console.log("edit Request User:", req.user); 
     try{
        const userEmail = (req.user as { email?: string })?.email;
        if (!userEmail) {
            res.status(HttpStatus.NOT_FOUND).json({ error: Messages.EMAIL_NOT_FOUNT });
            return;
        }
        const user = await userService.userProfile(userEmail)
        if (!user) {
            res.status(HttpStatus.NOT_FOUND).json({ error: Messages.NOT_FOUNT });
            return;
        }
        const { firstName, lastName, address, area } = req.body;
        let profilePicUrl: string | undefined;
        if (req.file) {
            profilePicUrl = await uploadProfilePic(req.file,user.profilePic);
        }
        const updates: Partial<any> = {};
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (profilePicUrl) updates.profilePic = profilePicUrl; 
        const updatedUser = await userService.updateUserProfile(user.email, updates);
        const userAddress = await addressService.updateAddress(user._id.toString(), address,area);
        res.status(HttpStatus.OK).json({ user: updatedUser ,address: userAddress });
     }catch (error:any) {
        console.error('Error updating profile:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: Messages.INTERNAL_SERVER_ERROR });
     }
        
    }
    
    async getAddress  (req:Request , res:Response):Promise<void> {
    const userId =  req.params.userId
    console.log("id.",userId)
    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
        throw new Error('Invalid user ID format');
      }
    
    const userAddress = await addressRepository.findAddressByUserId(userId)
    console.log("aaaaaaaaa",userAddress)
    res.status(HttpStatus.OK).json({  userAddress })
    }

    async availableSlots  (req:Request , res:Response) : Promise <void> {
        const { workerId, date } = req.query;
        console.log("dd",date)

        try {
            const slots = await availabilityService.fetchAvailableSlots(workerId as string, new Date(date as string));
            console.log("slots", slots);

            if (!slots ) {
                res.status(HttpStatus.NOT_FOUND).json({ message: Messages.NO_SLOTS });
                return;
            }

            res.status(HttpStatus.OK).json({ slots });
        } catch (error) {
            console.error("Error fetching slots:", error);
            res.status(500).json({ message: Messages.ERROR_FETCHING });
        }
    }
    
   async  createBooking  (req:Request , res:Response):Promise <void> {
        console.log('Request body:', req.body);
        try{
         const { date , slotId ,workerName , serviceImage , serviceName, workLocation , workDescription , workerId , userId , paymentStatus , totalPayment,advancePayment,balancePayment} = req.body ;

         const updateSlotStatus = await availabilityService.updateStatusOfSlot(slotId)
         const bookingDetails: Booking = {
             date,
             slotId,
             workLocation,
             workDescription,
             workerId,
             workerName,
             serviceImage,
             serviceName,
             userId,
             paymentStatus:'pending',
             bookingId: uuidv4(),
             workStatus: 'not_started',
             totalPayment,
             advancePayment,
             balancePayment,
         };
        const createdBooking = await bookingService.createBooking (bookingDetails);
        res.status(HttpStatus.CREATED).json(createdBooking);
        }catch (error) {
            console.error('Error creating booking:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message:Messages.ERROR_CREATING  });
        }
 }

 async getBookings (req:Request , res:Response) :Promise <void> {
    const { page, limit } = req.query;
    const {userId} = req.params;
    try{
        const parsedPage = parseInt(page as string, 10)||1;
        const parsedLimit = parseInt(limit as string, 10)||1;
     const bookings = await bookingService.getBookingsByUserId(userId ,  parsedPage, parsedLimit)
     console.log("booki", bookings)
     res.status(HttpStatus.OK).json({bookings})
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.ERROR_FETCHING });
    }
 }

 async fetchWorkerDetails (req:Request , res:Response) : Promise<void>  {
   const { workerId } = req.params;
   try{
    const workerDetails = await workerService.getWorker(workerId)
    res.status(HttpStatus.OK).json({workerDetails})
   }catch(error) {
    console.error("failed to fetch worker " , error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.ERROR_FETCHING });
   }
 }

 async cancelBooking (req:Request , res:Response) :Promise<void> {
    const { bookingId } = req.params;
    try {
        const updatedBooking = await bookingService.cancelBooking(bookingId);

        if (!updatedBooking) {
            res.status(HttpStatus.NOT_FOUND).json({ success: false, message:Messages.NOT_FOUNT });
            return;
        }

        res.status(HttpStatus.OK).json({
            success: true,
            message: Messages.CANCELLED_SUCCESSFULLY,
            data: updatedBooking,
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: Messages.ERROR_CANCELLING ,
        });
    }
 }

 async getServices  (req:Request , res:Response)  {
    const { page = 1, limit = 10, search = '' } = req.query;  
    try{
        const {services , totalServices} = await serviceManagement.getAllServices(
        parseInt(page as string), 
        parseInt(limit as string), 
        search as string
        );
        res.status(HttpStatus.OK).json({ 
            services, 
            totalServices 
        });

    }catch (error:any) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
 }

 async updateLocation (req:Request , res:Response) : Promise<void> {
             const { latitude, longitude, userId } = req.body;
 
             try {
                 const result = await addressService.updateLocation(userId, latitude, longitude);
                 
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

           async createPayment(req: Request, res: Response) {
            const { amount } = req.body; 
    
            try {
                const paymentIntent = await paymentService.createPaymentIntent(amount);
                res.status(HttpStatus.OK).json({
                    clientSecret: paymentIntent.client_secret,
                });
            } catch (error: any) {
                console.error('Error creating payment:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Payment processing failed' });
            }
        }
    
        async createCheckoutSession(req: Request, res: Response) {
            const { amount , bookingId , paymentType  , successUrl } = req.body; // Get amount from request body
           console.log("amount" , amount)
            try {
                const session = await paymentService.createCheckoutSession(amount , bookingId , paymentType , successUrl);
                res.status(HttpStatus.OK).json({ url: session.url });
            } catch (error: any) {
                console.error('Error creating checkout session:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create checkout session' });
            }
        }

        async getBooking (req:Request , res:Response) {
            const {bookingId} = req.params;
            try{
              const details = await bookingService.getBookingById(bookingId)
              if (!details) {
                 res.status(404).json({ message: 'Booking not found' });
                 return
              }
              res.json(details);
            }catch (error) {
                console.error('Error fetch details', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'error fetch booking details' });
            }
        }

        async updatePaymentStatus (req:Request , res:Response) {
            const {bookingId} = req.params;
            const {status } = req.body
            console.log("body" , req.body)
            try{
             const update = await bookingService.updateBookingById(bookingId , status)
             res.status(200) .json({message :'statusUpdated'})
            }catch(error) {
                console.error('Error updating payment', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'error updating payment' });
        
            }
        }

        async getWorkerProfile (req:Request , res:Response) {
            const {workerId} = req.params;
            try{
              const workerDetails = await workerService.getWorker(workerId)
              const address = await addressService.userAddress(workerId)
              console.log("kjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj")
              console.log("address" , address  , "worker" , workerDetails)
              res.status(HttpStatus.OK).json({address , workerDetails})
            }catch(error) {
                console.error('Error retrieving worker profile:', error);
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: Messages.INTERNAL_SERVER_ERROR});
            }
        }

        async handleSendMessage (req:Request , res:Response) {
            console.log("body", req.file)
            console.log("body", req.body)
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
                                     res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.ERROR_UPLOAD, error });
                                }
                            }
            try{
                const message = await chatService.sendMessage(chatId, senderId, senderModel, text , mediaUrl);
                const io = getIo();
                io.to(chatId).emit('newMessage', message);
                res.status(200).json(message);
            }catch (error) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.INTERNAL_SERVER_ERROR, error });
            }
        }
        async handleGetMessage (req:Request , res:Response) {
            const { chatId } = req.params;
            try{
                const messages = await chatService.getMessages(chatId);
                res.status(HttpStatus.OK).json(messages);
            }catch (error) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.ERRROR_FETCHING_MESSAGES, error });
            }
        }

        async handleCreateOrfetchChat (req:Request , res:Response) {
            const { userId, workerId } = req.body;
            try {
                const chat = await chatService.createOrFetchChat(userId, workerId);
                res.status(HttpStatus.OK).json(chat);
              } catch (error) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message:Messages.ERRROR_FETCHING_MESSAGES, error });
              }
        }

         async addReaction (req:Request , res:Response) {
                        console.log(req.body);
                        const { messageId } = req.params;
                        const { emoji } = req.body;
                        console.log("Message ID:", messageId, "Emoji:", emoji)
                      
                        const userModel= 'user';
        
                        if (!messageId || !emoji) {
                            res.status(HttpStatus.BAD_REQUEST).json({ error: "Message ID and emoji are required." });
                            return;
                          }
                          try {
                            console.log("Adding reaction:", { messageId, emoji });
                            const reaction = await chatService.updateReaction(messageId, emoji, userModel);
                            res.status(HttpStatus.OK).json(reaction);
                        } catch (error: any) {
                            console.error("Error adding reaction:", error); 
                            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({messages: Messages.ERROR_IN_ADDING_REACTION , error});
                        }
                       }
                           async getMessages (req:Request , res:Response) {
                          console.log('getMessages called'); // Check if the function is hit
                          const userId = req.params.userId;
                                           
                         try {
                           const chats = await chatService.getChatForUser(userId);
                               console.log('Chats for workerId:', userId, '->', chats);
                                           
                               if (chats.length === 0) {
                                res.status(HttpStatus.NOT_FOUND).json({ message: Messages.NOT_FOUNT  });
                                       }
                             console.log("chats........." , chats)
                              res.status(HttpStatus.OK).json(chats);
                               } catch (error: any) {
                               console.error('Error fetching chats:', error); // Log error for debugging
                               res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.NOT_FOUNT, error: error.message });
                               }
                               }
                             async getUnreadNotification (req:Request , res:Response) {
                                const { userId } = req.params
                                   console.log("userId" , userId)
                                       try{
                                         const unreadMessage = await chatService.getUnreadMessageUser(userId);
                                        console.log("unread" , unreadMessage)
                                     res.status(HttpStatus.OK).json(unreadMessage);
                                 }catch(error) {
                                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.ERRROR_FETCHING_MESSAGES, error });         
                                }
                           }

                    async getWorkersByUserId (req:Request , res:Response) {
                        const { userId } = req.params; 
                        console.log("userId" , userId)
                        try{
                      const  bookings = await bookingService.getBookingByUserId(userId)
                      if (Array.isArray(bookings) && bookings.length > 0) {
                        const workerNames = new Set(bookings.map((booking) => booking.workerName));
                        console.log('Worker Names:', Array.from(workerNames));
                    
                      const workerIds = await workerService.getWorkerIds(workerNames)
                      res.status(HttpStatus.OK).json({ workerIds }); 
                    }else{
                        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.NOT_FOUNT  });
                    }
                }catch (error:any) {
                    console.error('Error getting workers by user ID:', error);
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.FAILED_TO_GET_WORKERS, error: error.message });
                }

             }
          async getBalanceAmount (req:Request , res:Response) {
            const {bookingId} = req.params;
             console.log("bookingId" , bookingId)
             try{
              const  balance = await bookingService.getBalance(bookingId)
              console.log("balance" , balance)
              res.status(HttpStatus.OK).json(balance)
           }catch(error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({messages:Messages.INTERNAL_SERVER_ERROR , error})
        }
    }

    async getNotifications (req:Request , res:Response){
      const { userId } = req.params;
      console.log("userId for notification" , userId)
      try{
       const notifications = await notificationService.fetchNotifications(userId)
       res.status(HttpStatus.OK).json({notifications})
      }catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({messages:Messages.INTERNAL_SERVER_ERROR , error})
      }
    }
    async fetchBookingsDetails (req:Request , res:Response){
        const  {bookingId} = req.params;
        console.log("bookingId for notificationPage" , bookingId)
        try{
          const bookings = await bookingService.getBookings(bookingId)
          res.status(HttpStatus.OK).json({bookings})
        }catch (error) {
         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({messages:Messages.INTERNAL_SERVER_ERROR , error})
        }
    }
    async resetPasswordFromProfile (req:Request , res:Response) {
        const { newPassword } = req.body;
        const {userId} = req.params
        console.log("userId from auth" , userId)
        if (!newPassword || !userId) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.INVALID });
            return;
          }
          try {
            const message = await userService.resetPasswordFromUser(userId, newPassword);
            res.status(HttpStatus.OK).json({ message });
          } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || Messages.INTERNAL_SERVER_ERROR });
          }
    }

    async  getSlotsByDate (req:Request , res:Response) {
        console.log("date" , req.query)
        try {
            const { date } = req.query;
        
            // Validate query params
            if (!date) {
            res.status(400).json({ message: "Date is required" });
              return
            }
        
            const slots = await availabilityService.fetchSlotsByDate(date as string);
        
             res.status(200).json({ success: true, data: slots });
             return
          } catch (error) {
            console.error("Error fetching slots:", error);
           res.status(500).json({ success: false, message: "Internal server error" });
            return
          }
    }

    async addRatings (req:Request , res:Response) {
        try {
            const { userId, workerId, bookingId, review, rating } = req.body;

            // Validate the incoming data
            if (!userId || !workerId || !bookingId || !review || typeof rating !== 'number') {
                 res.status(400).json({ message: 'Invalid input' });
            }

            const ratingData: Ratings = {
                userId,
                workerId,
                bookingId,
                review,
                rating,
            };

            const createdRating = await ratingService.addRating(ratingData);
             res.status(201).json(createdRating);
        } catch (error) {
            console.error('Error adding rating:', error);
             res.status(500).json({ message: 'Internal server error' });
        }
    }

    async unreadNotification (req:Request , res:Response) {
     const {userId} = req.params 
     try{
      const unreadCount = await notificationService.getUnreadNotificationCount(userId)
      res.status(200).json({ unreadCount });
     }  catch (error) {
        console.error('Error fetching unread notifications:', error);
        res.status(500).json({ error: 'Failed to fetch unread notifications' });
     }
    }

    async markTrue (req:Request , res:Response) {
        const {userId} = req.params
        try{
      const IsReadTrue  = await notificationService.markIsReadTrue(userId)
      res.status(200).json({
        success: true,
    });
        }catch (error:any) {
            res.status(500).json({
                success: false,
                message: "Failed to mark notifications as read.",
                error: error.message,
            });
        }
    }
    async updateWallet(req: Request, res: Response) {
        const { userId, amount, transactionDetails, bookingId } = req.body;
        console.log("bodywallet", req.body)
    
        try {
          const adminShare = amount * 0.1 // 10% for admin
          const workerShare = amount * 0.9 // 90% for worker
          console.log("shares", adminShare, workerShare)
    
          // Update worker's wallet
          await walletService.workerWallet(userId, workerShare, {
            ...transactionDetails,
            amount: workerShare,
            type: "credit",
          })
    

        //   await notificationService.saveNotification({
        //     userId: userId,
        //     userType: "worker",
        //     bookingId: bookingId,
        //     message: `Your wallet has been credited with ₹${workerShare}`,
        //     isRead: false,
        //     timestamp: new Date(),
        // });
          // Update admin's wallet
          let adminWallet = await walletService.getAdminWallet()
          if (!adminWallet) {
            console.log("Creating Admin Wallet...")
            adminWallet = await walletService.createAdminWallet(adminShare, {
              ...transactionDetails,
              amount: adminShare,
              type: "credit",
            })
          } else {
            console.log("Updating Admin Wallet...")
            await walletService.updateAdminWallet(adminShare, {
              ...transactionDetails,
              amount: adminShare,
              type: "credit",
            })
          }
    
          console.log("Wallet update successful!")
          res.status(200).json({ success: true, message: "Wallets updated successfully" })
        } catch (error:any) {
          console.error("Error updating wallets:", error)
          res.status(500).json({ success: false, message: "Error updating wallets", error: error.message })
        }
      }
      async getReviewForWorker (req:Request , res:Response) {
        const {workerId} = req.params
        try{
         const review = await ratingService.getWorkerRatings(workerId)
         console.log("rrrrrr",review)
       res.status(200).json(review)
        }catch (error) {
            console.error("Error fetching worker ratings:", error);
            res.status(500).json({ message: 'Error fetching ratings', error });
        }
      }
      async  downloadInvoice  (req: Request, res: Response) {
        try {
          const {bookingId} = req.params;
          console.log("booh" , bookingId)
          const booking = await bookingService.getBookingById(bookingId)
           console.log("boo" , booking)
          if (!booking) {
             res.status(404).json({ message: "Booking not found" });
             return
          }
      
          await generateInvoicePDF(booking, res);
        } catch (error) {
          console.error("Error generating invoice:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
}
async googleSignup(req: Request, res: Response) {
    console.log('Google signup request received:', req.body);
    try {
        // Assuming user data comes from Firebase
        const { uid, name, email, profilePhoto } = req.body;

        // Call the service to handle the Google signup logic
        const user = await userService.handleGoogleSignup(uid, name, email, profilePhoto);

        // Generate tokens
        const accessToken = jwt.sign(
            { sub: user._id, email: user.email, role: user.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { sub: user._id, email: user.email, role: user.role },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        );

        // Set cookies with tokens
        res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
        res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
   console.log("acc" , accessToken)
   console.log('ref' , refreshToken)
        res.status(HttpStatus.OK).json({
            message: Messages.LOGIN, // Adjust the message if needed
            accessToken,
            refreshToken,
            userId: user._id.toString(),
            userFirstName: user.firstName,
            userEmail: user.email,
            userRole: user.role,
        });
    } catch (error: any) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
}
}



export const userController  = new UserController();




