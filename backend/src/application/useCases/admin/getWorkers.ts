
import { Worker } from "../../../domain/entities/worker";
import { WorkerRepositoryImpl } from "../../../infrastructure/database/repositories/WorkerRepositoryImpl";
const workerRepository = new WorkerRepositoryImpl();
export const getWorkers = async(page: number, limit: number, search: string): Promise<Worker[]|null> => {
    const skip = (page - 1) * limit;
    let workers = workerRepository.findAllWorkers(skip, limit, search)
    return workers;
}