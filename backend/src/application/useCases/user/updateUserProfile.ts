import { User } from "../../../domain/entities/User";
import { UserRepositoryImpl } from "../../../infrastructure/database/repositories/UserRepositoryImpl"
const userRepository = new UserRepositoryImpl();
export const updateUserProfile = async (userEmail: string , updates : Partial<User>) : Promise<User | null>=> {
    try{
        const user = await userRepository.findByEmail(userEmail)
        const updatedUser = await userRepository.updateUserProfile(userEmail, updates);

        return updatedUser;
    }catch (error) {
        console.error('Error updating user profile:', error); 
        throw new Error('Database error'); 
    }
}