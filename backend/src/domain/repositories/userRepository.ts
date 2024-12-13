import { User } from "../entities/User";

export interface UserRepository {
    createUser(user: User): Promise <User>;
    findByEmail(email: string,): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
    updatePassword(email: string, newPassword: string): Promise<void>;
    updateUser(user: User): Promise<User | null>;
    setVerifiedFalse(email: string): Promise<void>;
}