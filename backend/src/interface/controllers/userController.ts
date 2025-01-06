import { NextFunction , Request , Response } from "express";
import {  UserService } from "../../application/useCases/userService";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { loginUser } from "../../application/useCases/loginUser";
import { validateOtp } from "../../application/useCases/validateOTP";
import { generateOtp } from "../../application/useCases/generateOtp";
import { sendResetLink } from "../../application/useCases/passwordResent";
import { resetPassword } from "../../application/useCases/passwordResent";
import { validateToken } from "../../application/useCases/passwordResent";
import { v4 as uuidv4 } from 'uuid';
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
const addressRepository = new AddressRepositoryImpl();

const addressService = new AddressService();
const userService = new UserService();
const availabilityService = new AvailabilityService()
const bookingService = new BookingService();
const serviceManagement = new ServiceManagement();
const workerService = new WorkerService()
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
            const { accessToken, refreshToken ,userId } = await userService.loginUser(
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
                userId
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
         const { date , slotId ,workerName , serviceImage , serviceName, workLocation , workDescription , workerId , userId , paymentStatus , rate} = req.body ;

         const updateSlotStatus = await availabilityService.updateStatusOfSlot(slotId)
         const bookingDetails: Booking = {
             date, 
             slotId,
             workLocation,
             workDescription,
             workerId,
             workerName ,
             serviceImage,
             serviceName,
             userId,
             rate,
             paymentStatus: paymentStatus || 'Pending',
             bookingId: uuidv4(),
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
}



export const userController  = new UserController();




