import { ObjectId, Types } from 'mongoose';
import { Worker } from '../entities/worker';

export interface WorkerRepository {
    createWorker(worker: Worker): Promise<Worker>;
    findByEmail(email: string): Promise<Worker | null>;
    updatePassword(email: string, newPassword: string): Promise<void>; 
    updateWorkerProfile(workerEmail: string , update: Partial<Worker>): Promise<Worker | null>;
     updateBlockStatus(userId: string, isBlocked: boolean): Promise<Worker | null>; 
     findWorkersBySkill (skill : string):Promise<Worker []|[]>;
     getWorkerById(workerId:string) :Promise<Worker | null>;
     findAllWorkers(skip: number, limit: number, search: string):Promise<Worker[]|null>
     getWorkerIdsByNames (workerNames:Set<string>):Promise<string[]>
     updateWorkerAverageRating (workerId:string|Types.ObjectId , averageRating:number):Promise<void>
}
