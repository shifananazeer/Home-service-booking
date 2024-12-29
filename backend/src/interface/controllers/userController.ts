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
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken'
import { userProfile } from "../../application/useCases/user/userProfile";
import { refreshAccessToken } from "../../application/useCases/refreshAccessToken";
import { updateUserProfile } from "../../application/useCases/user/updateUserProfile";
import { uploadProfilePic } from "../../utils/s3Servise";
import { upadteAddress, userAddress } from "../../application/useCases/user/updateAddress";
import { AddressRepositoryImpl } from "../../infrastructure/database/repositories/AddressRepositoryIml";
import { availableSlots, fetchAvailableSlots, updateSlot, updateStatusOfSlot } from "../../application/useCases/worker/availability";
import { Booking } from "../../domain/entities/Booking";
import { createBookings, getBookingsByUserId } from "../../application/useCases/user/booking";
import { getWorkers } from "../../application/useCases/admin/getWorkers";
import { getWorker } from "../../application/useCases/user/getWorkerDetails";

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
            const { accessToken, refreshToken ,userId } = await loginUser(
                UserRepositoryImpl,
                req.body.email,
                req.body.password
            );
            console.log('Tokens generated:', { accessToken, refreshToken });
    
            // Set cookies with tokens
            res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
            res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
    
            // Send tokens in the response (optional)
            res.status(200).json({
                message: "You can now log in",
                accessToken,
                refreshToken,
                userId
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
      },
    validateOtp: async (req: Request, res: Response) => {
        try {
            const { accessToken, refreshToken, role, valid  , userId} = await validateOtp(req.body.email, req.body.otp, 1);

        // Set tokens in cookies
        res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
        res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
        res.status(200).json({
            message: 'OTP verified Successfully. You can Log in',
            valid,
            role,
            accessToken,
            refreshToken,
            userId,
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
    refreshAccessToken: async (req: Request, res: Response): Promise<void> => {
        const { refreshToken } = req.body;
    
        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token is required" });
            return;
        }
        try {
            const accessToken = await refreshAccessToken(refreshToken);
            res.status(200).json({ accessToken });
        } catch (error: any) {
            console.error("Error refreshing access token:", error.message);
            if (error.name === "TokenExpiredError") {
                res.status(401).json({ error: "Refresh token expired. Please log in again." });
            } else if (error.name === "JsonWebTokenError") {
                res.status(401).json({ error: "Invalid refresh token. Please log in again." });
            } else {
                res.status(500).json({ error: error.message || "Internal server error" });
            }
        }
    },
    getUserProfile: async (req: Request, res: Response): Promise<void> => {
        console.log("Request User:", req.user); 
    
        try {
          
            const userEmail = (req.user as { email?: string })?.email; 
    
           
            if (!userEmail) {
                res.status(404).json({ error: 'User email not found in request' });
                return; 
            }
    
          
            const user = await userProfile(userEmail);
            const addressResponse = await userAddress(user._id); 
            console.log("address.............", addressResponse, "user", user);
    
         
            if (!addressResponse.address) {
          
                res.status(200).json({
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
    
         
            res.status(200).json({
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
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    editProfile: async (req: Request, res: Response) => {
        console.log("edit Request User:", req.user); 
     try{
        const userEmail = (req.user as { email?: string })?.email;
        if (!userEmail) {
            res.status(404).json({ error: 'User email not found in request' });
            return;
        }
        const user = await userProfile(userEmail)
        if (!user) {
            res.status(404).json({ error: 'User not found' });
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

       
        const updatedUser = await updateUserProfile(user.email, updates);


        const userAddress = await upadteAddress(user._id.toString(), address,area);

        
        res.status(200).json({ user: updatedUser ,address: userAddress });
     }catch (error:any) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
     }
        
    },
    getAddress : async (req:Request , res:Response):Promise<void> => {
    const userId =  req.params.userId
    console.log("id.",userId)
    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
        throw new Error('Invalid user ID format');
      }
    
     
    const userAddress = await AddressRepositoryImpl.findAddressByUserId(userId)
    console.log("aaaaaaaaa",userAddress)
    res.status(200).json({  userAddress })
    },
    availableSlots : async (req:Request , res:Response) : Promise <void> => {
        const { workerId, date } = req.query;
        console.log("dd",date)

        try {
            const slots = await fetchAvailableSlots(workerId as string, new Date(date as string));
            console.log("slots", slots);

            if (!slots ) {
                res.status(404).json({ message: "No available slots for the given worker and date" });
                return;
            }

            res.status(200).json({ slots });
        } catch (error) {
            console.error("Error fetching slots:", error);
            res.status(500).json({ message: "Failed to fetch available slots" });
        }
    },
    
    createBooking : async (req:Request , res:Response):Promise <void>=> {
        try{
         const { date , slotId ,workerName , serviceImage , serviceName, workLocation , workDescription , workerId , userId , paymentStatus} = req.body ;

         const updateSlotStatus = await updateStatusOfSlot(slotId)
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
             paymentStatus: paymentStatus || 'Pending',
             bookingId: uuidv4(),
         };
        const createdBooking = await createBookings (bookingDetails);
        res.status(201).json(createdBooking);
        }catch (error) {
            console.error('Error creating booking:', error);
            res.status(500).json({ message: 'Failed to create booking.' });
        }
 },

 getBookings : async (req:Request , res:Response) :Promise <void> => {
    const {userId} = req.params;
    try{
     const bookings = await getBookingsByUserId(userId)
     res.status(200).json({bookings})
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
 },

 fetchWorkerDetails: async (req:Request , res:Response) : Promise<void> => {
   const { workerId } = req.params;
   try{
    const workerDetails = await getWorker(workerId)
    res.status(200).json({workerDetails})
   }catch(error) {
    console.error("failed to fetch worker " , error);
    res.status(500).json({ message: 'Failed to fetch workerDetails' });
   }
 }
}




