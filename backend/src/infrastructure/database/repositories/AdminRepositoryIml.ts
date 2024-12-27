import { User } from "../../../domain/entities/User"
import UserModel from "../models/userModels"
import { AdminRepository } from "../../../domain/repositories/adminRepository";
import WorkerModel from "../models/workerModel";
import { Worker } from "../../../domain/entities/worker";
import { Service } from "../../../domain/entities/Service";
import ServiceModel from "../models/serviceModel";
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
}
}