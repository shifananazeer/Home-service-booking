import { Service } from "../../../domain/entities/Service";
import { AdminRepository } from "../../../domain/repositories/adminRepository";
import { ServiceRepository } from "../../../domain/repositories/serviceRepository";
interface CreateServiceInput {
    name: string;
    description: string;
    image: string;
}
export const createdServices = async (
    serviceRepository: ServiceRepository,
    serviceData: CreateServiceInput
): Promise<Service> => {
    // Additional business logic or validations can be added here
    return await serviceRepository.createService(serviceData);
};

export const allServices = async (adminRepository:AdminRepository, page:number,limit: number , search:string):Promise<Service[]| null> => {
    const skip = (page - 1) * limit;
    const services = await adminRepository.findServices(skip , limit , search);  
    return services;
}