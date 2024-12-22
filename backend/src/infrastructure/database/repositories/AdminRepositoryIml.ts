import { User } from "../../../domain/entities/User"
import UserModel from "../models/userModels"
import { AdminRepository } from "../../../domain/repositories/adminRepository";
import WorkerModel from "../models/workerModel";
import { Worker } from "../../../domain/entities/worker";
export const AdminRepositoryImpl: AdminRepository = {
async findUsers() : Promise<User[] | null> {
    const users = await UserModel.find();
    return users;
},
async findWorkers () : Promise<Worker[] | null> {
    const workers = await WorkerModel.find();
    return workers;
}
}