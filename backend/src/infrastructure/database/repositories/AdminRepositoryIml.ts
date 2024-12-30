import { User } from "../../../domain/entities/User"
import UserModel from "../models/userModels"
import { AdminRepository } from "../../../domain/repositories/adminRepository";
import WorkerModel from "../models/workerModel";
import { Worker } from "../../../domain/entities/worker";
import { Service } from "../../../domain/entities/Service";
import ServiceModel from "../models/serviceModel";
import AdminModel from "../models/adminModel";
import { Admin } from "../../../domain/entities/Admin";
import { Booking } from "../../../domain/entities/Booking";
import BookingModel from "../models/bookingModel";
export const AdminRepositoryImpl: AdminRepository = {
    async findUsers(skip: number, limit: number, search: string): Promise<User[] | null> {
        const query = search ? { firstName: { $regex: search, $options: 'i' } } : {};
        const users = await UserModel.find(query).skip(skip).limit(limit);
        return users;
    },
async findWorkers (skip: number, limit: number, search: string) : Promise<Worker[] | null> {
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const workers = await WorkerModel.find(query).skip(skip).limit(limit);
    return workers;
},
async findServices(skip: number, limit:number,search:string):Promise<Service[]|null> {
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const services = await ServiceModel.find(query).skip(skip) .limit(limit);
    return services;
},
async countServices(search: string): Promise<number> {
    return await ServiceModel.countDocuments({
        name: { $regex: search, $options: "i" }, 
    });
},
async findByEmail(email:string) :Promise<Admin|null> {
    const admin = await AdminModel.findOne({email});
    return admin ? admin.toObject():null;
},
async getBookings() :Promise<Booking[]|[]> {
    return await BookingModel.find()
    .populate('userId', 'name email') 
  
    .sort({ createdAt: -1 }); // Sort by latest bookings
}
}