import { Worker } from '../entities/worker';

export interface WorkerRepository {
    createWorker(worker: Worker): Promise<Worker>;
    findByEmail(email: string): Promise<Worker | null>;
}
