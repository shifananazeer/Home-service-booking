import { Request,Response } from "express";
import {loginAdmin}  from '../../application/useCases/loginAdmin'
import { AdminRepositoryImpl } from "../../infrastructure/database/repositories/AdminRepositoryIml";
import { getUsers } from '../../application/useCases/admin/getUsers'
import { getWorkers } from "../../application/useCases/admin/getWorkers";
import { uploadProfilePic } from "../../utils/s3Servise";
import { ServiceRepositoryImpl } from "../../infrastructure/database/repositories/ServiceRepositoryIml";
import { allServices, createdServices } from "../../application/useCases/admin/services";
import { uploadServiceImage } from "../../utils/uploadServiseImage";
import { Service } from "../../domain/entities/Service";


export const adminController =  {
 adminLogin: async(req:Request , res:Response) =>{
    console.log("body",req.body)
   try{
    const {email, password} = req.body
    const token = await loginAdmin(email , password)
    res.cookie('auth_token', token,{
        httpOnly:true,
        maxAge:86400000
    })
    res.status(200).json({message:"You can login now",token})
   }catch(error:any) {
    res.status(400).json({message: error.message})
   }
 },
 getUser: async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    try {
        const users = await getUsers(AdminRepositoryImpl, parseInt(page as string), parseInt(limit as string), search as string);
        console.log(users);
        res.status(200).json({ users });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
},
 getWorker: async (req:Request , res:Response) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    try{
        const workers = await getWorkers(AdminRepositoryImpl, parseInt(page as string), parseInt(limit as string), search as string);
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

        // Validate required fields
        if (!name || !description) {
            res.status(400).json({ message: 'Name and description are required' });
            return;
        }

        let serviceImageUrl: string = ""; // Set a default empty string

        // Check for uploaded file
        if (req.file) {
            // Upload the image and get the URL
            serviceImageUrl = await uploadProfilePic(req.file);
        }

        // Log received data for debugging
        console.log('Received data:', { name, description, image: serviceImageUrl });

        // Create the service using the repository
        const createdService = await createdServices(ServiceRepositoryImpl, {
            name,
            description,
            image: serviceImageUrl, // This is now guaranteed to be a string
        });


        // Return the success response
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
            AdminRepositoryImpl, 
            parseInt(page as string), 
            parseInt(limit as string), 
            search as string
        );

        // Send response with services and total count
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
        // Handle image upload if a new file is provided
        if (req.file) {
            // Assuming req.file is defined when using multer
            imageUrl = await uploadServiceImage(req.file, req.body.currentImageUrl);
        }

        // Prepare the data to update
        const updateData: Partial<Service> = {
            name,
            description,
            ...(imageUrl && { image: imageUrl }), // Only add imageUrl if it's defined
        };

        // Update the service using the repository
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

}