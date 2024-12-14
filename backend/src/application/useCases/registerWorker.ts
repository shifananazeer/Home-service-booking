import { WorkerRepository } from "../../domain/repositories/workerRepository";
import { Worker } from "../../domain/entities/worker";
import bcrypt from 'bcryptjs'

export const registerWorker = async(workerRepository : WorkerRepository , workerData:Worker): Promise<Worker> => {
    const existingWorker = await workerRepository.findByEmail(workerData.email)
    if(existingWorker) throw new Error ('Email already Exist')
        const hashedPassword = await bcrypt.hash(workerData.password , 10)
    workerData.role = 'worker'
    workerData.password = hashedPassword
    return workerRepository.createWorker(workerData)
}