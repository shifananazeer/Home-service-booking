// import { User } from "../../../domain/entities/User"
// import UserModel from "../models/userModels"
// import { AdminRepository } from "../../../domain/repositories/adminRepository";
// import WorkerModel from "../models/workerModel";
// import { Worker } from "../../../domain/entities/worker";
// import { Service } from "../../../domain/entities/Service";
// import ServiceModel from "../models/serviceModel";
// import AdminModel from "../models/adminModel";
// import { Admin } from "../../../domain/entities/Admin";
// import { Booking } from "../../../domain/entities/Booking";
// import BookingModel from "../models/bookingModel";
// export const AdminRepositoryImpl: AdminRepository = {

//     async findUsers(skip: number, limit: number, search: string): Promise<User[] | null> {
//         const query = search ? { firstName: { $regex: search, $options: 'i' } } : {};
//         const users = await UserModel.find(query).skip(skip).limit(limit);
//         return users;
//     },
// async findWorkers (skip: number, limit: number, search: string) : Promise<Worker[] | null> {
//     const query = search ? { name: { $regex: search, $options: 'i' } } : {};
//     const workers = await WorkerModel.find(query).skip(skip).limit(limit);
//     return workers;
// },
// async findServices(skip: number, limit:number,search:string):Promise<Service[]|null> {
//     const query = search ? { name: { $regex: search, $options: 'i' } } : {};
//     const services = await ServiceModel.find(query).skip(skip) .limit(limit);
//     return services;
// },
// async countServices(search: string): Promise<number> {
//     return await ServiceModel.countDocuments({
//         name: { $regex: search, $options: "i" }, 
//     });
// },
// async findByEmail(email:string) :Promise<Admin|null> {
//     const admin = await AdminModel.findOne({email});
//     return admin ? admin.toObject():null;
// },
// async getBookings(params: { page: number; limit: number; search: string }): Promise<{ bookings: Booking[]; total: number }> {
//     const { page, limit, search } = params;

//     const skip = (page - 1) * limit; 
//     const query = search ? { bookingId: { $regex: search, $options: 'i' } } : {};
//     const total = await BookingModel.countDocuments(query);
//     const bookings = await BookingModel.find(query)
//         .populate('userId', 'name email') 
//         .sort({ createdAt: -1 }) 
//         .skip(skip)
//         .limit(limit); 

//     return { bookings, total };
// }
// }