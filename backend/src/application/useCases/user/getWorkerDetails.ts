import { Worker } from "../../../domain/entities/worker"
import { WorkerRepositoryImpl } from "../../../infrastructure/database/repositories/WorkerRepositoryImpl"

export const getWorker = async(workerId:string) : Promise<Worker | null> => {
  try {
    const worker = await WorkerRepositoryImpl.getWorkerById(workerId);
    return worker;
  }catch (error) {
    console.error('Error Finding worker', error) ;
    throw new Error("failed")
  }
}