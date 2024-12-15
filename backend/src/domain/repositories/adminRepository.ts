  import { User } from "../entities/User";

export interface AdminRepository {
    findUsers(): Promise<User[]|null>,
}