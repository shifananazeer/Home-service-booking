import { AdminRepository } from "../../../domain/repositories/adminRepository";
import { User } from "../../../domain/entities/User";

export const getUsers = async (adminRepository:AdminRepository):Promise<User[]|null> => {
    let users = adminRepository.findUsers()
    return users;
}