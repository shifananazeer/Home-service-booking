import { ObjectId, Types } from "mongoose";
import { Worker } from "../../../domain/entities/worker";
import { WorkerRepository } from "../../../domain/repositories/workerRepository";
import WorkerModel from "../models/workerModel";

export class WorkerRepositoryImpl implements WorkerRepository {
    async createWorker(worker: Worker): Promise<Worker> {
        const createdWorker = await WorkerModel.create(worker);
        return createdWorker.toObject() as Worker;
    }

    async findByEmail(email: string): Promise<Worker | null> {
        console.log()
        const worker = await WorkerModel.findOne({ email });
        console.log("workerfind",worker)
        return worker ? (worker.toObject() as Worker) : null;
    }

    async updatePassword(email: string, hashedPassword: string): Promise<void> {
        const result = await WorkerModel.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );
        if (result.modifiedCount === 0) {
            throw new Error('Password update failed, user not found or password unchanged.');
        }
    }

    async updateWorkerProfile(email: string, updates: Partial<Worker>): Promise<Worker | null> {
        const updatedWorker = await WorkerModel.findOneAndUpdate(
            { email },
            { $set: updates },
            { new: true }
        );
        return updatedWorker ? updatedWorker.toObject() : null;
    }

    async updateBlockStatus(workerId: string, isBlocked: boolean): Promise<Worker | null> {
        const updatedWorker = await WorkerModel.findByIdAndUpdate(
            workerId,
            { isBlocked },
            { new: true }
        );
        return updatedWorker ? updatedWorker.toObject() : null;
    }

    async findWorkersBySkill(skill: string): Promise<Worker[]> {
        return await WorkerModel.find({ skills: skill }).exec();
    }

    async getWorkerById(workerId: string): Promise<Worker | null> {
        const worker = await WorkerModel.findById( workerId );
        return worker ? worker.toObject() as Worker : null;
    }

    async findAllWorkers(skip: number, limit: number, search: string): Promise<Worker[] | null> {
        const query = search ? { name: { $regex: search, $options: "i" } } : {};
        const workers = await WorkerModel.find(query)
        .select("name email profilePic") 
        .skip(skip).limit(limit);
        return workers;
    }
    async getWorkerIdsByNames(workerNames: Set<string>): Promise<string[]> {
        try {
            const workers = await WorkerModel.find({ name: { $in: Array.from(workerNames) } });
            return workers.map(worker => worker._id.toString()); 
        } catch (error) {
            console.error('Error fetching worker IDs:', error);
            return []; 
        }
    }
    async updateWorkerAverageRating (workerId: string |Types.ObjectId, averageRating: number): Promise<void>  {
        const updateAverage = await WorkerModel.findByIdAndUpdate(workerId, { averageRating });
        console.log("updateAvgRaings" , updateAverage)
    }

}
