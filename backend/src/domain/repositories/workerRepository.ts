import { Worker } from '../entities/worker';

export interface WorkerRepository {
    createWorker(worker: Worker): Promise<Worker>;
    findByEmail(email: string): Promise<Worker | null>;
    updatePassword(email: string, newPassword: string): Promise<void>; 
    updateWorkerProfile(workerEmail: string , update: Partial<Worker>): Promise<Worker | null>;
}
