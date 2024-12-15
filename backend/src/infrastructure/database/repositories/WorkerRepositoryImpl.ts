import { Worker } from "../../../domain/entities/worker";
import { WorkerRepository } from "../../../domain/repositories/workerRepository";
import WorkerModel from "../models/workerModel";


export const WorkerRepositoryImpl: WorkerRepository = {
    async createWorker(worker: Worker): Promise<Worker> {
        const createdWorker = await WorkerModel.create(worker);
        return createdWorker.toObject() as Worker; // Cast to Worker type
    },

    async findByEmail(email: string): Promise<Worker | null> {
        const worker = await WorkerModel.findOne({ email });
        return worker ? (worker.toObject() as Worker) : null; // Cast to Worker type
    },
    async updatePassword(email: string, hashedPassword: string): Promise<void> {
        const result = await WorkerModel.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (result.modifiedCount === 0) {
            throw new Error('Password update failed, user not found or password unchanged.');
        }
    },

    
};
