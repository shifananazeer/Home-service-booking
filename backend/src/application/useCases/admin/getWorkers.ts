import { AdminRepository } from "../../../domain/repositories/adminRepository";
import { Worker } from "../../../domain/entities/worker";

export const getWorkers = async(adminRepository:AdminRepository,page: number, limit: number, search: string): Promise<Worker[]|null> => {
    const skip = (page - 1) * limit;
    let workers = adminRepository.findWorkers(skip, limit, search)
    return workers;
}