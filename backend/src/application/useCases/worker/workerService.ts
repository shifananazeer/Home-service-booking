import { WorkerRepositoryImpl } from "../../../infrastructure/database/repositories/WorkerRepositoryImpl";
import { Worker } from "../../../domain/entities/worker";

export const workerService = async (skill: string | undefined): Promise<Worker[]> => { // Update return type
    if (!skill) {
        throw new Error('Skill is required');
    }

    const workers = await WorkerRepositoryImpl.findWorkersBySkill(skill);

    if (workers.length === 0) {
        throw new Error('No workers found with this skill');
    }

    return workers; // This should now correctly return ServiceWorker[]
};