
import { User } from "../../../domain/entities/User";
import { UserRepositoryImpl } from "../../../infrastructure/database/repositories/UserRepositoryImpl";

export const blockUser = async (userId: string): Promise<User | null> => {
    return await UserRepositoryImpl.updateBlockStatus(userId, true);
};

export const unblockUser = async (userId: string): Promise<User | null> => {
    return await UserRepositoryImpl.updateBlockStatus(userId, false);
};
