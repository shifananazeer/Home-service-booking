// src/infrastructure/repositories/userRepositoryImpl.ts
import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../../domain/repositories/userRepository";
import UserModel from "../models/userModels"; // Ensure the path is correct

export const UserRepositoryImpl: UserRepository = {
    async createUser(user: User): Promise<User> {
        const createdUser = await UserModel.create(user);
        return createdUser.toObject();
    },
    async findByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email });
        return user ? user.toObject() : null;
    },
    async findByGoogleId(googleId: string): Promise<User | null> {
        const user = await UserModel.findOne({ googleId });
        return user ? user.toObject() : null;
    },
    async updatePassword(email: string, newPassword: string): Promise<void> {
        await UserModel.updateOne({ email }, { password: newPassword });
    },
    async updateUser(user: User): Promise<User | null> {
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: user.email }, // Update by email (consider using userId instead)
            { isVerified: user.isVerified }, // Update the isVerified field
            { new: true } // Return the updated document
        );
        return updatedUser ? updatedUser.toObject() : null;
    },
    async setVerifiedFalse(email: string): Promise<void> {
        await UserModel.updateOne({ email }, { isVerified: false });
    },
    async updateBlockStatus(userId: string, isBlocked: boolean): Promise<User | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isBlocked }, { new: true });
        return updatedUser ? updatedUser.toObject() : null;
    }
};
