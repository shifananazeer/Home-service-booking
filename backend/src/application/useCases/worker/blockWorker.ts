
import { Worker } from "../../../domain/entities/worker";
import { WorkerRepositoryImpl } from "../../../infrastructure/database/repositories/WorkerRepositoryImpl";


export const blockWorker = async (workerId: string): Promise<Worker | null> => {
    return await WorkerRepositoryImpl.updateBlockStatus(workerId, true);
};

export const unblockWorker = async (workerId: string): Promise<Worker | null> => {
    return await WorkerRepositoryImpl.updateBlockStatus(workerId, false);
};