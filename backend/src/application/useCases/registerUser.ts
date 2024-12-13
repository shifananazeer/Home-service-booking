import { hash } from "crypto";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/userRepository";
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import bcrypt from 'bcryptjs'

export const registerUser = async (
    userRepository: UserRepository,
    userData: User
): Promise<User> => {
    // Check if the user already exists by email
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
        throw new Error("Email already exists");
    }

    // Hash the user's password
    const password = userData.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashed", hashedPassword);
    
    // Set the hashed password
    userData.password = hashedPassword;
   
    // Create the user in the database
    const createdUser = await userRepository.createUser(userData);
    console.log("Stored password in DB:", createdUser.password); // Log the stored password after creation
    
    return createdUser;
}; 