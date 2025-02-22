import { UserData } from "../../../application/useCases/userService";
import { Service } from "../../../domain/entities/Service";
import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../../domain/repositories/userRepository";
import ServiceModel from "../models/serviceModel";
import UserModel, { UserDocument } from "../models/userModels";


interface GoogleUserData {
    uid: string;
    name: string;
    email: string;
    profilePhoto: string;
}

export class UserRepositoryImpl implements UserRepository {
    async createUser(user: User): Promise<User> {
        const createdUser = await UserModel.create(user);
        return createdUser.toObject();
    }
     async createUserFromGoogle({ uid, name, email, profilePhoto }: GoogleUserData): Promise<User> {
        const nameParts = name.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        const newUser = new UserModel({
            googleId: uid,
            firstName,
            lastName,
            email,
            profilePhoto,
            is_verified: true,
            role: "user", // Default role, modify as needed
        });

        await newUser.save();
        return newUser;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email });
        return user ? user.toObject() : null;
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        const user = await UserModel.findOne({ googleId });
        return user ? user.toObject() : null;
    }

    async updatePassword(email: string, newPassword: string): Promise<void> {
        await UserModel.updateOne({ email }, { password: newPassword });
    }

    async updateUser(user: User): Promise<User | null> {
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: user.email },
            { isVerified: user.isVerified },
            { new: true }
        );
        return updatedUser ? updatedUser.toObject() : null;
    }

    async setVerifiedFalse(email: string): Promise<void> {
        await UserModel.updateOne({ email }, { isVerified: false });
    }

    async updateBlockStatus(userId: string, isBlocked: boolean): Promise<User | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isBlocked }, { new: true });
        return updatedUser ? updatedUser.toObject() : null;
    }

    async updateUserProfile(email: string, updates: Partial<User>): Promise<User | null> {
        const updatedUser = await UserModel.findOneAndUpdate(
            { email },
            { $set: updates },
            { new: true }
        );
        return updatedUser ? updatedUser.toObject() : null;
    }

    async findServices(skip: number, limit: number, search: string): Promise<Service[] | null> {
        const query = search ? { name: { $regex: search, $options: "i" } } : {};
        const services = await ServiceModel.find(query).skip(skip).limit(limit);
        return services;
    }

    async countServices(search: string): Promise<number> {
        return await ServiceModel.countDocuments({
            name: { $regex: search, $options: "i" },
        });
    }

    async findAllUsers(skip: number, limit: number, search: string): Promise<User[] | null> {
        const query = search ? { firstName: { $regex: search, $options: "i" } } : {};
        const users = await UserModel.find(query)
        .select("firstName lastName email profilePic") 
        .skip(skip).limit(limit);
        return users;
    }
    async getNameById(userId: string): Promise<string> { 
        const user = await UserModel.findById(userId, 'firstName');
        return user?.firstName || ''; 
    }

    async updatePasswordByUserId (userId:string , hashedPassword:string): Promise<boolean> {
        try {
            const result = await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
            return result ? true : false;
          } catch (error) {
            console.error('Error updating password:', error);
            throw new Error('Database operation failed.');
          }
    }
}
