
import { User } from "../../../domain/entities/User";
import { UserRepositoryImpl } from "../../../infrastructure/database/repositories/UserRepositoryImpl";
const userRepository = new UserRepositoryImpl();
export const getUsers = async ( page: number, limit: number, search: string): Promise<User[] | null> => { 
    const skip = (page - 1) * limit;
    const users = await userRepository.findAllUsers(skip, limit, search);
    return users;
}