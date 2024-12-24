import { Worker } from "../../../domain/entities/worker";
import { WorkerRepository } from "../../../domain/repositories/workerRepository";
import WorkerModel from "../models/workerModel";


export const WorkerRepositoryImpl: WorkerRepository = {
    async createWorker(worker: Worker) {
        const createdWorker = await WorkerModel.create(worker);
        return createdWorker.toObject() as Worker; 
    },

    async findByEmail(email: string){
        const worker = await WorkerModel.findOne({ email });
        return worker ? (worker.toObject() as Worker) : null; 
    },
    async updatePassword(email: string, hashedPassword: string) {
        const result = await WorkerModel.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (result.modifiedCount === 0) {
            throw new Error('Password update failed, user not found or password unchanged.');
        }
    },
   async updateWorkerProfile(email:string , updates: Partial <Worker>) {
        return await WorkerModel.findOneAndUpdate (
            {email},
            {$set: updates},
            {new:true}
        )
   },
   async updateBlockStatus(workerId: string, isBlocked: boolean) {
           const updatedWorker = await WorkerModel.findByIdAndUpdate(workerId, { isBlocked }, { new: true });
           return updatedWorker ? updatedWorker.toObject() : null;
       },
       async findWorkersBySkill(skill: string): Promise<Worker[]> { // Update return type
        return await WorkerModel.find({ skills: skill }).exec();
    }
}
