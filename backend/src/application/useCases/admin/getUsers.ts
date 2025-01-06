// UserService.ts
import { User } from "../../../domain/entities/User";
import { UserRepositoryImpl } from "../../../infrastructure/database/repositories/UserRepositoryImpl";
import { UserRepository } from "../../../domain/repositories/userRepository";

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepositoryImpl();
    }

    public async getUsers(page: number, limit: number, search: string): Promise<User[] | null> {
        const skip = (page - 1) * limit;
        const users = await this.userRepository.findAllUsers(skip, limit, search);
        return users;
    }
}
