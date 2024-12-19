import { UserRepository } from "../../../domain/repositories/userRepository"
import { UserRepositoryImpl } from "../../../infrastructure/database/repositories/UserRepositoryImpl"

export const userProfile = async (email:string ) => {
    try {
        // Fetch user from repository
        const user = await UserRepositoryImpl.findByEmail(email);
    
        // Handle case where user is not found
        if (!user) {
          throw new Error("User not found");
        }
    
        return user; // Return user data
      } catch (error: any) {
        console.error("Error in userProfile use case:", error); // Log error for debugging
        throw new Error(error.message || "Error fetching user profile");
      }
}