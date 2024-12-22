import { AdminRepository } from "../../../domain/repositories/adminRepository";
import { User } from "../../../domain/entities/User";

export const getUsers = async (adminRepository: AdminRepository, page: number, limit: number, search: string): Promise<User[] | null> => { 
    const skip = (page - 1) * limit;
    const users = await adminRepository.findUsers(skip, limit, search);
    return users;
}