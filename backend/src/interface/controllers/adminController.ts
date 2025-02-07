import { Request, Response } from "express";
import { AdminService} from '../../application/useCases/adminService';
import { UserService } from '../../application/useCases/userService';
import { WorkerService } from "../../application/useCases/workerService";
import { uploadProfilePic } from "../../utils/s3Servise";
import { ServiceRepositoryImpl } from "../../infrastructure/database/repositories/ServiceRepositoryIml";
import {  ServiceManagement } from "../../application/useCases/servicesManagement";
import { uploadServiceImage } from "../../utils/uploadServiseImage";
import { Service } from "../../domain/entities/Service";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { refreshAccessToken } from "../../application/useCases/refreshAccessToken";
import { HttpStatus } from "../../utils/httpStatus";
import { Messages } from "../../utils/message";
import {BookingRepositoryImpl} from "../../infrastructure/database/repositories/BookingRepositoryImpl";
import { BookingService } from "../../application/useCases/bookingService";
import { WalletService } from "../../application/useCases/walletService";
const adminService = new AdminService();
const userService = new UserService();
const workerService = new WorkerService();
const serviceManagement = new ServiceManagement();
const bookingService = new BookingService();
const walletService = new WalletService();

 
class AdminController {
    async adminLogin(req: Request, res: Response): Promise<void> {
        console.log("body", req.body);
        try {
            const { email, password } = req.body;
            const { accessToken, refreshToken, adminId  , adminEmail , adminRole} = await adminService.login(email, password);
            res.cookie("auth_token", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 minutes
            res.cookie("refresh_token", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
            res.status(HttpStatus.OK).json({
                message: Messages.LOGIN,
                accessToken,
                refreshToken,
                adminId,
                adminEmail,
                adminRole,
            });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        }
    }

    async getUser(req: Request, res: Response): Promise<void> {
        const { page = 1, limit = 10, search = '' } = req.query;
        try {
            const users = await userService.getUsers(parseInt(page as string), parseInt(limit as string), search as string);
            console.log(users);
            res.status(HttpStatus.OK).json({ users });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        }
    }

    async getWorker(req: Request, res: Response): Promise<void> {
        const { page = 1, limit = 10, search = '' } = req.query;
        try {
            const workers = await  workerService.getWorkers(parseInt(page as string), parseInt(limit as string), search as string);
            console.log(workers);
            res.status(HttpStatus.OK).json({ workers });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        }
    }

    async createService(req: Request, res: Response): Promise<void> {
        try {
            const { name, description } = req.body;
            const imagePath = req.file ? req.file.path : '';
            console.log('Received body:', req.body);
            console.log('Received file:', req.file);
            if (!name || !description) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.REQUIRED });
                return;
            }
            let serviceImageUrl: string = "";
            if (req.file) {
                serviceImageUrl = await uploadServiceImage(req.file);
            }
            console.log('Received data:', { name, description, image: serviceImageUrl });
            const createdService = await serviceManagement.createService({
                name,
                description,
                image: serviceImageUrl,
            });
            res.status(HttpStatus.CREATED).json({ message: Messages.SERVICE_CREATE, service: createdService });
        } catch (error) {
            console.error("Error creating service:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: Messages.INTERNAL_SERVER_ERROR });
        }
    }

    async getAllServices(req: Request, res: Response): Promise<void> {
        console.log(2);
        const { page = 1, limit = 10, search = '' } = req.query;
        try {
            const { services, totalServices } = await serviceManagement.getAllServices(
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
    }

    async updateService(req: Request, res: Response): Promise<void> {
        const serviceId = req.params.serviceId;
        const { name, description } = req.body;

        try {
            let imageUrl: string | undefined;
            if (req.file) {
                imageUrl = await uploadServiceImage(req.file, req.body.currentImageUrl);
                console.log("imageurl", imageUrl);
            } else {
                imageUrl = req.body.currentImageUrl;
                console.log("OLDurl", imageUrl);
            }

            const updatedService = await serviceManagement.updateService({
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
    }

    async deleteService(req: Request, res: Response): Promise<void> {
        const { serviceId } = req.params;

        try {
            await serviceManagement.deleteService(serviceId);
            res.status(HttpStatus.OK).json({ message: Messages.SERVICE_DELETED_SUCCESS });
        } catch (error: any) {
            console.error("Error deleting service:", error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: Messages.SERVICE_DELETE_ERROR });
        }
    }

    async getAllBookings(req: Request, res: Response): Promise<void> {
        const page = Math.max(1, parseInt(req.query.page as string)) || 1;
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string))) || 10;
        const search = req.query.search as string || '';

        try {
            const params = { page, limit, search };
            const { bookings, total } = await bookingService.fetchAllBookings(params);
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
    }

    async refreshAccessToken(req: Request, res: Response): Promise<void> {
        const { refreshToken } = req.body;
        console.log("bbody", req.body)

        if (!refreshToken) {
            res.status(HttpStatus.BAD_REQUEST).json({ error: Messages.REFRESHTOKEN_REQUIRED });
            return;
        }
        try {
            const type = 'admin';
            const accessToken = await refreshAccessToken(refreshToken ,type);
            res.status(HttpStatus.OK).json({ accessToken });
        } catch (error: any) {
            console.error("Error refreshing access token:", error.message);
            if (error.name === "TokenExpiredError") {
                res.status(HttpStatus.UNAUTHORIZED).json({ error: Messages.REFRESHTOKEN_EXPIRED });
            } else if (error.name === Messages.TOKEN_ERROR) {
                res.status(HttpStatus.UNAUTHORIZED).json({ error: Messages.INVALID_REFRESHTOKEN });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message || Messages.INTERNAL_SERVER_ERROR });
            }
        }
    }

    async getRevenue  (req:Request , res:Response):Promise<void> {
        try {
            const timeFrame: string | undefined = req.query.timeFrame as string;
      
            const validTimeFrame = timeFrame || 'monthly';
            const revenue = await walletService.getAdminRevenue( validTimeFrame);
      
            res.status(200).json({ success: true, revenue });
          } catch (error: any) {
            console.error("Error fetching revenue and bookings:", error);
            res.status(500).json({ success: false, message: error.message });
          }
    }

         async getBookingCount(req: Request, res: Response) {
                    try {
                      
                        const timeFrame: string | undefined = req.query.timeFrame as string;
                
                        const validTimeFrame = timeFrame || 'monthly';
                
                        const count = await bookingService.getCountByAdmin( validTimeFrame);
                        res.status(200).json(count);
                    } catch (error) {
                        console.error("Error fetching booking count:", error);
                        res.status(500).json({ message: "Internal Server Error" });
                    }
                }

                async getPopularService (req:Request , res:Response){
                    try {
                        const limit = Number(req.query.limit) || 5; // Default to top 5
                        const popularServices = await bookingService.getMostBookedServices(limit);
                
                        res.status(200).json({ success: true, data: popularServices });
                    } catch (error) {
                        console.error("Error fetching popular services:", error);
                        res.status(500).json({ success: false, message: "Server error", error });
                    }
                }


                async topWorkers (req:Request , res:Response) {
                    try {
                        const workers = await adminService.getMostBookedWorkers();
                        res.status(200).json({ data: workers });
                      } catch (error) {
                        console.error("Error fetching most booked workers:", error);
                        res.status(500).json({ message: "Error fetching most booked workers", error });
                      }
                }

                async getWallet (req:Request , res:Response) {
                    try{
                   const walletDetails = await walletService.getAdminWallet()
                   res.status(200).json(walletDetails)
                    }catch (error) {

                    }
                }

               async  workerProfile  (req:Request , res:Response) {
                try{
                  const {workerId} = req.params;
                  const worker  = await workerService.findWorkerById(workerId)
                  res.status(200).json(worker)
                }catch (error) {

                }
               }
}


export const adminController = new AdminController();
