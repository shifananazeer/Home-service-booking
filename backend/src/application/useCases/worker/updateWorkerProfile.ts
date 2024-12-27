import { Worker } from "../../../domain/entities/worker"
import { WorkerRepositoryImpl } from "../../../infrastructure/database/repositories/WorkerRepositoryImpl"


export const updateWorkerProfile = async (workerEmail : string , updates: Partial<Worker>) : Promise < Worker | null> => {
try {
    const worker = await WorkerRepositoryImpl.findByEmail(workerEmail)
    const updatedWorker = await WorkerRepositoryImpl.updateWorkerProfile(workerEmail, updates);
    console.log("updated worker" , updatedWorker)
    return updatedWorker ;
}catch (error) {
    console.error('Error updating user profile:', error); 
        throw new Error('Database error'); 
}
}