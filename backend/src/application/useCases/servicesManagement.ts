// ServiceManagement.ts
import { Service } from "../../domain/entities/Service";
import { ServiceRepository } from "../../domain/repositories/serviceRepository";
import { ServiceRepositoryImpl } from "../../infrastructure/database/repositories/ServiceRepositoryIml"
import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";

interface CreateServiceInput {
    name: string;
    description: string;
    image: string;
}
interface UpdateServiceInput {
    serviceId: string;
    name?: string;
    description?: string;
    imageUrl?: string; 
}

interface UpdateServiceData {
    name?: string;
    description?: string;
    image?: string; 
}

export class ServiceManagement {
  
    private serviceRepository: ServiceRepository;
    private userRepository: UserRepositoryImpl;

    constructor() {
        this.serviceRepository = new ServiceRepositoryImpl();
        this.userRepository = new UserRepositoryImpl();
    }

    public async createService(serviceData: CreateServiceInput): Promise<Service> {
        return await this.serviceRepository.createService(serviceData);
    }

    public async getAllServices(page: number, limit: number, search: string): Promise<{ services: Service[] | null; totalServices: number }> {
        const skip = (page - 1) * limit;
        const totalServices = await this.userRepository.countServices(search);
        const services = await this.userRepository.findServices(skip, limit, search);

        return { services, totalServices };
    }
    public async fetchAllServices(): Promise<{ success: boolean; services: Service[]; message?: string }> {
        try {
            const services = await this.serviceRepository.getAllServices();
            if (!services || services.length === 0) {
                return {
                    success: true,
                    services: [],
                    message: "No services available",
                };
            }
            return { success: true, services };
        } catch (error: any) {
            console.error("Error fetching services:", error.message);
            throw new Error("Failed to fetch services");
        }
    }

    public async updateService(data: UpdateServiceInput): Promise<Service | null> {
        console.log("data", data);
        const { serviceId, imageUrl, ...updateData } = data;
        if (imageUrl) {
            (updateData as UpdateServiceData).image = imageUrl; 
        }

        try {
            const updatedService = await this.serviceRepository.updateService(serviceId, updateData as UpdateServiceData); 
            console.log("updated", updatedService);
            if (!updatedService) {
                throw new Error("Service not found");
            }
            return updatedService;
        } catch (error: any) {
            console.error("Error updating service:", error.message);
            throw error;
        }
    }

    public async deleteService(serviceId: string): Promise<void> {
        try {
            await this.serviceRepository.deleteService(serviceId);
        } catch (error: any) {
            console.error("Error deleting service in use case:", error.message);
            throw new Error("Failed to delete service.");
        }
    }
}
