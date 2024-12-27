import { User } from "../../../domain/entities/User";
import { UserRepositoryImpl } from "../../../infrastructure/database/repositories/UserRepositoryImpl"

export const updateUserProfile = async (userEmail: string , updates : Partial<User>) : Promise<User | null>=> {
    try{
        const user = await UserRepositoryImpl.findByEmail(userEmail)
        const updatedUser = await UserRepositoryImpl.updateUserProfile(userEmail, updates);

        return updatedUser;
    }catch (error) {
        console.error('Error updating user profile:', error); 
        throw new Error('Database error'); 
    }
}