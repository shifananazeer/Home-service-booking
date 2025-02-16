import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { User } from "../../domain/entities/User";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import admin from "../../config/firbaseAdmin";

export interface UserData {
    email: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    role: string;
    googleId: string;
    password: string;
    isOnline: boolean;
}

export class UserService {
    private userRepository: UserRepositoryImpl;

    constructor() {
        this.userRepository = new UserRepositoryImpl();
    }

    public async registerUser(userData: User): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error("Email already exists");
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.role = 'user';
        userData.password = hashedPassword;

        return this.userRepository.createUser(userData);
    }

    public async loginUser(
        email: string,
        password: string
    ): Promise<{ accessToken: string; refreshToken: string; userId: string ,userFirstName:string , userEmail:string , userRole:string}> {
        const user: User | null = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid email or password");
        }
        if (user.isBlocked) {
            throw new Error("You are blocked by the admin. Please contact support.");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
        const accessToken = jwt.sign(
            { sub: user._id, email: user.email, role: user.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" } 
        );
        const refreshToken = jwt.sign(
            { sub: user._id, email: user.email, role: user.role },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" } 
        );
        console.log("User ID:", user._id);

        return {
            accessToken,
            refreshToken,
            userId: user._id.toString(), 
            userFirstName : user.firstName,
            userEmail: user.email,
            userRole:user.role,
        };
    }

    public async blockUser(userId: string): Promise<User | null> {
        return await this.userRepository.updateBlockStatus(userId, true);
    }

    public async unblockUser(userId: string): Promise<User | null> {
        return await this.userRepository.updateBlockStatus(userId, false);
    }

    public async userProfile(email: string): Promise<User | null> {
        try {
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error("User not found");
            }
            console.log("user", user);
            return user;
        } catch (error: any) {
            console.error("Error in userProfile use case:", error);
            throw new Error(error.message || "Error fetching user profile");
        }
    }
    public async getUsers(page: number, limit: number, search: string): Promise<User[] | null> {
        const skip = (page - 1) * limit;
        const users = await this.userRepository.findAllUsers(skip, limit, search);
        return users;
    }

    public async updateUserProfile(userEmail: string, updates: Partial<User>): Promise<User | null> {
        try {
          const user = await this.userRepository.findByEmail(userEmail);
          if (!user) {
            throw new Error("User not found");
          }
    
          const updatedUser = await this.userRepository.updateUserProfile(userEmail, updates);
          return updatedUser;
        } catch (error) {
          console.error('Error updating user profile:', error);
          throw new Error('Database error');
        }
      }
      async getName(userId:string) {
        try {
          return await this.userRepository.getNameById(userId);
        } catch (error) {
          console.error("Error in UserService.getName:", error);
          throw new Error("Failed to fetch user name");
        }
      }
     async resetPasswordFromUser (userId:string , newPassword:string){
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const isUpdated = await this.userRepository.updatePasswordByUserId(userId, hashedPassword);
        if (!isUpdated) {
          throw new Error('Failed to update password.');
        }
        return 'Password reset successfully.';
      }
      async handleGoogleSignup(uid: string, name: string, email: string, profilePhoto: string): Promise<User> {
        // Check if the user already exists
        let user = await this.userRepository.findByEmail(email);

        if (!user) {
            // If not, create a new user
            user = await this.userRepository.createUserFromGoogle({ uid, name, email, profilePhoto });
        }

        return user;
    }

}
