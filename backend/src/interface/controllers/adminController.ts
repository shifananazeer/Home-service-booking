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


export const adminController =  {
 adminLogin: async(req:Request , res:Response) =>{
    console.log("body",req.body)
   try{
    const {email, password} = req.body
    const { accessToken, refreshToken , adminId}= await loginAdmin( email , password)
    res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
    res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
    res.status(200).json({
        message: "You can now log in",
        accessToken,
        refreshToken,
        adminId,
    });
   }catch(error:any) {
    res.status(400).json({message: error.message})
   }
 },
 getUser: async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    try {
        const users = await getUsers( parseInt(page as string), parseInt(limit as string), search as string);
        console.log(users);
        res.status(200).json({ users });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
},
 getWorker: async (req:Request , res:Response) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    try{
        const workers = await getWorkers(parseInt(page as string), parseInt(limit as string), search as string);
        console.log(workers);
        res.status(200).json({workers})
    }catch (error :any) {
        res.status(400).json({message:error.message})
    }
 },
 createService: async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;
    const imagePath = req.file ? req.file.path : '';
        console.log('Received body:', req.body);
        console.log('Received file:', req.file);
        if (!name || !description) {
            res.status(400).json({ message: 'Name and description are required' });
            return;
        }
        let serviceImageUrl: string = ""; 
        if (req.file) {
            serviceImageUrl = await uploadProfilePic(req.file);
        }
        console.log('Received data:', { name, description, image: serviceImageUrl });
        const createdService = await createdServices(ServiceRepositoryImpl, {
            name,
            description,
            image: serviceImageUrl, 
        });
        res.status(201).json({ message: "Service created successfully", service: createdService });
    } catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({ error: "Internal server error" });
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
        res.status(200).json({ 
            services, 
            totalServices 
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
},

updateService: async(req:Request , res:Response) :Promise<void>=> {
    const serviceId = req.params.serviceId;
    const { name, description } = req.body;
    let imageUrl: string | undefined;

    try {
        if (req.file) {
            imageUrl = await uploadServiceImage(req.file, req.body.currentImageUrl);
        }
        const updateData: Partial<Service> = {
            name,
            description,
            ...(imageUrl && { image: imageUrl }),
        };
        const updatedService = await ServiceRepositoryImpl.updateService(serviceId, updateData);
        if (!updatedService) {
            res.status(404).json({ message: "Service not found" });
            return 
        }
         res.status(200).json({ message: "Service updated successfully", updatedService });
         return
    } catch (error: any) {
        console.error("Error updating service:", error);
       
         res.status(500).json({ message: "Internal server error", error: error.message });
         return
    }
},

deleteService : async (req:Request , res:Response) : Promise<void> => {
    const {serviceId} = req.params;
    try {
        await ServiceRepositoryImpl.deleteService(serviceId);
      
        res.status(200).json({ message: "Service deleted successfully." });
        return 
    } catch (error: any) {
        console.error("Error deleting service:", error);
        res.status(500).json({ error: "Error deleting service." });
    
        return 
    }
},

getAllBookings: async (req: Request, res: Response): Promise<void> => {
    
    const page = Math.max(1, parseInt(req.query.page as string)) || 1; 
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string))) || 10; 
    const search = req.query.search as string || '';

    try {
        const { bookings, total } = await fetchAllBookings( page, limit, search);
        res.status(200).json({
            message: "Bookings retrieved successfully",
            bookings,
            total,
            lastPage: Math.ceil(total / limit), 
        });
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to retrieve bookings",
            error: error.message,
        });
    }
},
 refreshAccessToken: async (req: Request, res: Response): Promise<void> => {
        const { refreshToken } = req.body;
    
        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token is required" });
            return;
        }
        try {
            const type = 'admin'
            const accessToken = await refreshAccessToken(refreshToken , type);
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
}