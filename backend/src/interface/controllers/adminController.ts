import { Request,Response } from "express";
import {loginAdmin}  from '../../application/useCases/loginAdmin';
import { getUsers } from '../../application/useCases/admin/getUsers'
import { getWorkers } from "../../application/useCases/admin/getWorkers";
import { uploadProfilePic } from "../../utils/s3Servise";
import { ServiceRepositoryImpl } from "../../infrastructure/database/repositories/ServiceRepositoryIml";
import { allServices, createdServices } from "../../application/useCases/admin/services";
import { uploadServiceImage } from "../../utils/uploadServiseImage";
import { Service } from "../../domain/entities/Service";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { fetchAllBookings } from "../../application/useCases/admin/getBookings";
import { refreshAccessToken } from "../../application/useCases/refreshAccessToken";
import { deleteServiceUseCase, updateServiceUseCase } from "../../application/useCases/getAllService";
import { HttpStatus } from "../../utils/httpStatus";
import { Messages } from "../../utils/message";


export const adminController =  {
 adminLogin: async(req:Request , res:Response) =>{
    console.log("body",req.body)
   try{
    const {email, password} = req.body
    const { accessToken, refreshToken , adminId}= await loginAdmin( email , password)
    res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
    res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
    res.status(HttpStatus.OK).json({
        message: Messages.LOGIN,
        accessToken,
        refreshToken,
        adminId,
    });
   }catch(error:any) {
    res.status(HttpStatus.BAD_REQUEST).json({message: error.message})
   }
 },
 getUser: async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    try {
        const users = await getUsers( parseInt(page as string), parseInt(limit as string), search as string);
        console.log(users);
        res.status(HttpStatus.OK).json({ users });
    } catch (error: any) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
},
 getWorker: async (req:Request , res:Response) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    try{
        const workers = await getWorkers(parseInt(page as string), parseInt(limit as string), search as string);
        console.log(workers);
        res.status(HttpStatus.OK).json({workers})
    }catch (error :any) {
        res.status(HttpStatus.BAD_REQUEST).json({message:error.message})
    }
 },
 createService: async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;
    const imagePath = req.file ? req.file.path : '';
        console.log('Received body:', req.body);
        console.log('Received file:', req.file);
        if (!name || !description) {
            res.status(HttpStatus.BAD_REQUEST).json({ message:Messages.REQUIRED  });
            return;
        }
        let serviceImageUrl: string = ""; 
        if (req.file) {
            serviceImageUrl = await uploadServiceImage(req.file);
        }
        console.log('Received data:', { name, description, image: serviceImageUrl });
        const createdService = await createdServices( {
            name,
            description,
            image: serviceImageUrl, 
        });
        res.status(HttpStatus.CREATED).json({ message:Messages.SERVICE_CREATE , service: createdService });
    } catch (error) {
        console.error("Error creating service:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: Messages.INTERNAL_SERVER_ERROR });
    }
},

getAllServices: async(req:Request , res:Response) => {
    console.log(2)
    const { page = 1, limit = 10, search = '' } = req.query;
    try {
        const { services, totalServices } = await allServices(
        
            parseInt(page as string), 
            parseInt(limit as string), 
            search as string
        );
        res.status(HttpStatus.OK).json({ 
            services, 
            totalServices 
        });
    } catch (error: any) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
},

updateService: async(req:Request , res:Response) :Promise<void>=> {
    const serviceId = req.params.serviceId;
    const { name, description } = req.body;

    try {
        let imageUrl: string | undefined;
        if (req.file) {
            // Upload new image and get the new image URL
            imageUrl = await uploadServiceImage(req.file, req.body.currentImageUrl);
            console.log("imageurl",imageUrl)
        } else {
            // If no new file, retain the current image URL
            imageUrl = req.body.currentImageUrl;
            console.log("OLDurl",imageUrl)
        }

        const updatedService = await updateServiceUseCase({
            serviceId,
            name,
            description,
            imageUrl,
        });

        res.status(HttpStatus.OK).json({ message: Messages.SERVICE_UPDATED_SUCCESS, updatedService });
    } catch (error: any) {
        if (error.message === "Service not found") {
            res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.INTERNAL_SERVER_ERROR, error: error.message });
        }
    }
},

deleteService : async (req:Request , res:Response) : Promise<void> => {
    const { serviceId } = req.params;

    try {
        await deleteServiceUseCase(serviceId);
        res.status(HttpStatus.OK).json({ message: Messages.SERVICE_DELETED_SUCCESS });
    } catch (error: any) {
        console.error("Error deleting service:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: Messages.SERVICE_DELETE_ERROR });
    }
},

getAllBookings: async (req: Request, res: Response): Promise<void> => {
    
    const page = Math.max(1, parseInt(req.query.page as string)) || 1; 
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string))) || 10; 
    const search = req.query.search as string || '';

    try {
        const { bookings, total } = await fetchAllBookings( page, limit, search);
        res.status(HttpStatus.OK).json({
            message: Messages.BOOKING_RETRIVED,
            bookings,
            total,
            lastPage: Math.ceil(total / limit), 
        });
    } catch (error: any) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: Messages.FAILED_RETRIVED,
            error: error.message,
        });
    }
},
 refreshAccessToken: async (req: Request, res: Response): Promise<void> => {
        const { refreshToken } = req.body;
    
        if (!refreshToken) {
            res.status(HttpStatus.BAD_REQUEST).json({ error:Messages.REFRESHTOKEN_REQUIRED });
            return;
        }
        try {
            const type = 'admin'
            const accessToken = await refreshAccessToken(refreshToken , type);
            res.status(HttpStatus.OK).json({ accessToken });
        } catch (error: any) {
            console.error("Error refreshing access token:", error.message);
            if (error.name === "TokenExpiredError") {
                res.status(HttpStatus.UNAUTHORIZED).json({ error: Messages.REFRESHTOKEN_EXPIRED});
            } else if (error.name === Messages.TOKEN_ERROR) {
                res.status(HttpStatus.UNAUTHORIZED).json({ error: Messages.INVALID_REFRESHTOKEN });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message || Messages.INTERNAL_SERVER_ERROR });
            }
        }
    },
}