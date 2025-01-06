// import { WorkerRepositoryImpl } from "../../../infrastructure/database/repositories/WorkerRepositoryImpl"
// const workerRepository = new WorkerRepositoryImpl();
// export const workerProfile = async (email:string) => {
//     try{
//     const worker = await workerRepository.findByEmail(email);
//     console.log("wwwww",worker)
//     if(!worker) {
//         throw new Error("Worker not found");
//     }
//     console.log("worker" , worker)
//     return worker
//     }catch (error: any) {
//         console.error("Error in userProfile use case:", error); 
//         throw new Error(error.message || "Error fetching user profile");
//     }
// }