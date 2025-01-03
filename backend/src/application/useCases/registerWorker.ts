import { WorkerRepository } from "../../domain/repositories/workerRepository";
import { Worker } from "../../domain/entities/worker";
import bcrypt from 'bcryptjs'
import { WorkerRepositoryImpl } from "../../infrastructure/database/repositories/WorkerRepositoryImpl";
const workerRepository = new WorkerRepositoryImpl();

export const registerWorker = async(workerData:Worker): Promise<Worker> => {
    const existingWorker = await workerRepository.findByEmail(workerData.email)
    if(existingWorker) throw new Error ('Email already Exist')
        if (workerData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long.');
        }
    
        const hashedPassword = await bcrypt.hash(workerData.password , 10)
        
    workerData.role = 'worker'
    workerData.password = hashedPassword
    return workerRepository.createWorker(workerData)
}