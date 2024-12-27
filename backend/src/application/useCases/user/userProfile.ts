import { UserRepository } from "../../../domain/repositories/userRepository"
import { UserRepositoryImpl } from "../../../infrastructure/database/repositories/UserRepositoryImpl"

export const userProfile = async (email:string ) => {
    try {
        const user = await UserRepositoryImpl.findByEmail(email);
        if (!user) {
          throw new Error("User not found");
        }
      console.log("user",user)
        return user; 
      } catch (error: any) {
        console.error("Error in userProfile use case:", error); 
        throw new Error(error.message || "Error fetching user profile");
      }
}