import { WorkerRepository } from "../../../domain/repositories/workerRepository";
import { Worker } from "../../../domain/entities/worker";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { WorkerRepositoryImpl } from "../../../infrastructure/database/repositories/WorkerRepositoryImpl";

export class WorkerService {
    private workerRepository: WorkerRepository;

    constructor() {
        this.workerRepository = new WorkerRepositoryImpl();
    }

    public async registerWorker(workerData: Worker): Promise<Worker> {
        const existingWorker = await this.workerRepository.findByEmail(workerData.email);
        if (existingWorker) throw new Error('Email already exists');
        
        if (workerData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long.');
        }

        const hashedPassword = await bcrypt.hash(workerData.password, 10);
        
        workerData.role = 'worker';
        workerData.password = hashedPassword;

        return this.workerRepository.createWorker(workerData);
    }


    public async loginWorker(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; workerId: string }> {
        console.log("password", password);
        console.log("email", email);

        const user = await this.workerRepository.findByEmail(email);
        console.log("role....", user?.role);

        if (!user) throw new Error('Invalid Email Or Password');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error('Invalid Password');

        const accessToken = jwt.sign(
            { email: user.email, role: user.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { email: user.email, role: user.role },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken, workerId: user._id.toString() };
    }

    public async workerProfile(email: string) {
        try {
            const worker = await this.workerRepository.findByEmail(email);
            console.log("wwwww", worker);

            if (!worker) {
                throw new Error("Worker not found");
            }

            console.log("worker", worker);
            return worker;
        } catch (error: any) {
            console.error("Error in workerProfile use case:", error);
            throw new Error(error.message || "Error fetching user profile");
        }
    }


    public async blockWorker(workerId: string): Promise<Worker | null> {
        return await this.workerRepository.updateBlockStatus(workerId, true);
    }

    public async unblockWorker(workerId: string): Promise<Worker | null> {
        return await this.workerRepository.updateBlockStatus(workerId, false);
    }
    public async findWorkersBySkill(skill: string | undefined): Promise<Worker[]> {
        if (!skill) {
            throw new Error('Skill is required');
        }

        const workers = await this.workerRepository.findWorkersBySkill(skill);

        if (workers.length === 0) {
            throw new Error('No workers found with this skill');
        }

        return workers;
    }
   

    public async updateWorkerProfile(workerEmail: string, updates: Partial<Worker>): Promise<Worker | null> {
        try {
            const worker = await this.workerRepository.findByEmail(workerEmail);
            if (!worker) {
                throw new Error('Worker not found');
            }

            const updatedWorker = await this.workerRepository.updateWorkerProfile(workerEmail, updates);
            console.log("Updated worker:", updatedWorker);
            return updatedWorker;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw new Error('Database error');
        }
    }

}


