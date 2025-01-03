import { UserRepository } from "../../domain/repositories/userRepository";
import bcrypt from 'bcryptjs'
import { User } from "../../domain/entities/User";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
const userRepository = new UserRepositoryImpl();
export const registerUser=async(userData:User):Promise<User>=>{
    const existingUser=await userRepository.findByEmail(userData.email)
    if(existingUser) throw new Error("Email already exists")
    const hashedPassword=await bcrypt.hash(userData.password,10)
    userData.role = 'user'
    userData.password=hashedPassword
    return userRepository.createUser(userData)
}