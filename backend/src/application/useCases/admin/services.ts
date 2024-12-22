import { Service } from "../../../domain/entities/Service";
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