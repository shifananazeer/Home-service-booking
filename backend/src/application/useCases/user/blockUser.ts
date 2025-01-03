
import { User } from "../../../domain/entities/User";
import { UserRepositoryImpl } from "../../../infrastructure/database/repositories/UserRepositoryImpl";
const userRepository = new UserRepositoryImpl();

export const blockUser = async (userId: string): Promise<User | null> => {
    return await userRepository.updateBlockStatus(userId, true);
};

export const unblockUser = async (userId: string): Promise<User | null> => {
    return await userRepository.updateBlockStatus(userId, false);
};
