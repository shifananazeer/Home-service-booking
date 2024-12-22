import { Request,Response } from "express";
import {loginAdmin}  from '../../application/useCases/loginAdmin'
import { AdminRepositoryImpl } from "../../infrastructure/database/repositories/AdminRepositoryIml";
import { getUsers } from '../../application/useCases/admin/getUsers'
import { getWorkers } from "../../application/useCases/admin/getWorkers";
import { uploadProfilePic } from "../../utils/s3Servise";
import { ServiceRepositoryImpl } from "../../infrastructure/database/repositories/ServiceRepositoryIml";
import { createdServices } from "../../application/useCases/admin/services";


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
 createService: async (req:Request , res: Response):Promise<void> => {
    try {
        const { name, description } = req.body;
        console.log('Received body:', req.body);
        console.log('Received file:', req.file);

        // Validate required fields
        if (!name || !description) {
            res.status(400).json({ message: 'Name and description are required' });
            return;
        }

        let serviceImageUrl: string | undefined;

        // Check for uploaded file
        if (req.file) {
            // Upload the image and get the URL
            serviceImageUrl = await uploadProfilePic(req.file);
        } else {
            res.status(400).json({ message: 'Image is required' });
            return;
        }

        // Log received data for debugging
        console.log('Received data:', { name, description, image: serviceImageUrl });

        // Create the service using the repository
        const createdService = await createdServices(ServiceRepositoryImpl, {
            name,
            description,
            image: serviceImageUrl,
        });

        // Return the success response
        res.status(201).json({ message: "Service created successfully", service: createdService });
    } catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
}