import { AdminRepository } from "../../../domain/repositories/adminRepository";
import { Worker } from "../../../domain/entities/worker";

export const getWorkers = async(adminRepository:AdminRepository): Promise<Worker[]|null> => {
    let workers = adminRepository.findWorkers()
    return workers;
}