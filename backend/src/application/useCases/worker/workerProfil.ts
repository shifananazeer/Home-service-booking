import { WorkerRepositoryImpl } from "../../../infrastructure/database/repositories/WorkerRepositoryImpl"

export const workerProfile = async (email:string) => {
    try{
    const worker = await WorkerRepositoryImpl.findByEmail(email);
    if(!worker) {
        throw new Error("Worker not found");
    }
    console.log("worker" , worker)
    return worker
    }catch (error: any) {
        console.error("Error in userProfile use case:", error); 
        throw new Error(error.message || "Error fetching user profile");
    }
}