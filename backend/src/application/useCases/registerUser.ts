import { hash } from "crypto";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/userRepository";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import bcrypt from 'bcryptjs'

export const registerUser=async(userRepository:UserRepository,userData:User):Promise<User>=>{
    const existingUser=await userRepository.findByEmail(userData.email)
    if(existingUser) throw new Error("Email already exists")
        const password = userData.password
    const hashedPassword = await bcrypt.hash(password, 10);
console.log("hashed",hashedPassword)
    userData.password=hashedPassword
    const createdUser = await userRepository.createUser(userData);

    console.log("Stored password in DB:", createdUser.password); // Log the stored password after creation
    return createdUser;
}