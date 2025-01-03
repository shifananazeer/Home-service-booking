import { Service } from "../../../domain/entities/Service";
import { ServiceRepository } from "../../../domain/repositories/serviceRepository";
import { ServiceRepositoryImpl } from "../../../infrastructure/database/repositories/ServiceRepositoryIml";
import { UserRepositoryImpl } from "../../../infrastructure/database/repositories/UserRepositoryImpl";
interface CreateServiceInput {
    name: string;
    description: string;
    image: string;
}
const serviceRepository = new ServiceRepositoryImpl();
const userRepository = new UserRepositoryImpl();
export const createdServices = async (serviceData: CreateServiceInput): Promise<Service> => {  
    return await serviceRepository.createService(serviceData);
};

export const allServices = async ( page:number,limit: number , search:string):Promise<{ services: Service[] | null; totalServices: number }> => {
    const skip = (page - 1) * limit;
    const totalServices = await userRepository.countServices(search);
    const services = await userRepository.findServices(skip , limit , search);  
    
    return { services, totalServices };
}