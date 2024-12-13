import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../../domain/repositories/userRepository";
import  UserModel  from "../models/userModels"

export const UserRepositoryImpl: UserRepository = {
    async createUser(user: User): Promise <User> {
        const createdUser = await UserModel.create(user);
        return createdUser.toObject()
    },
    async findByEmail(email: string) : Promise<User | null> {
        const user = await UserModel.findOne({email});
        return user ? user.toObject() : null
    },
    async findByGoogleId(googleId: string): Promise<User | null> {
        return await UserModel.findOne({ googleId });
    },
    async updatePassword(email: string, newPassword: string): Promise<void> {
        await UserModel.updateOne({ email }, { password: newPassword });
    }
}