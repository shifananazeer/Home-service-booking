// WorkerService.ts
import { Worker } from "../../../domain/entities/worker";
import { WorkerRepositoryImpl } from "../../../infrastructure/database/repositories/WorkerRepositoryImpl";
import { WorkerRepository } from "../../../domain/repositories/workerRepository"; // Adjust the import path if necessary

export class WorkerService {
    private workerRepository: WorkerRepository;

    constructor() {
        this.workerRepository = new WorkerRepositoryImpl();
    }

    public async getWorkers(page: number, limit: number, search: string): Promise<Worker[] | null> {
        const skip = (page - 1) * limit;
        const workers = await this.workerRepository.findAllWorkers(skip, limit, search);
        return workers;
    }
}
