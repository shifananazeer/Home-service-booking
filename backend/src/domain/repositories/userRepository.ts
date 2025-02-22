import { Service } from "../entities/Service";
import { User } from "../entities/User";

export interface UserRepository {
    createUser(user: User): Promise <User>;
    findByEmail(email: string,): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
    updatePassword(email: string, newPassword: string): Promise<void>;
    updateUser(user: User): Promise<User | null>;
    setVerifiedFalse(email: string): Promise<void>;
    updateBlockStatus(userId: string, isBlocked: boolean): Promise<User | null>; 
    updateUserProfile(userEmail: string, updates: Partial<User>): Promise<User | null>;
     findServices(skip: number , limit:number , search:string):Promise<Service[]|null>;
     countServices(search: string): Promise<number>;
     findAllUsers(skip: number, limit: number, search: string): Promise<User[] | null>;
}