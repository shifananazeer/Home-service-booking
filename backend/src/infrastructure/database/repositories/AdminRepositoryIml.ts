import { User } from "../../../domain/entities/User"
import UserModel from "../models/userModels"
import { AdminRepository } from "../../../domain/repositories/adminRepository";

export const AdminRepositoryImpl: AdminRepository = {
async findUsers() : Promise<User[] | null> {
    const users = await UserModel.find();
    return users;
}
}