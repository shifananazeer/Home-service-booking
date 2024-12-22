import { User } from "../../../domain/entities/User"
import UserModel from "../models/userModels"
import { AdminRepository } from "../../../domain/repositories/adminRepository";
import WorkerModel from "../models/workerModel";
import { Worker } from "../../../domain/entities/worker";
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
}
}