import { Service } from "../../../domain/entities/Service";
import { UserRepository } from "../../../domain/repositories/userRepository";

export const allServices = async (userRepository:UserRepository, page:number,limit: number , search:string):Promise<{ services: Service[] | null; totalServices: number }> => {
    const skip = (page - 1) * limit;
    const totalServices = await userRepository.countServices(search);
    const services = await userRepository.findServices(skip , limit , search);  
    
    return { services, totalServices };
}