// useCases/service/getAllServices.ts

import { Service } from "../../domain/entities/Service";
import { ServiceRepositoryImpl } from "../../infrastructure/database/repositories/ServiceRepositoryIml";
const serviceRepository = new ServiceRepositoryImpl();

export const getAllServicesUseCase = async (): Promise<{ success: boolean; services: Service[]; message?: string }> => {
    try {
        const services = await serviceRepository.getAllServices();
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
};



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

export const updateServiceUseCase = async (data: UpdateServiceInput): Promise<Service | null> => {
    console.log("data", data);
    const { serviceId, imageUrl, ...updateData } = data;
    if (imageUrl) {
       (updateData as UpdateServiceData).image = imageUrl; 
    }

    try {
        const updatedService = await serviceRepository.updateService(serviceId, updateData as UpdateServiceData); 
        console.log("updated", updatedService);
        if (!updatedService) {
            throw new Error("Service not found");
        }
        return updatedService;
    } catch (error: any) {
        console.error("Error updating service:", error.message);
        throw error;
    }
};


export const deleteServiceUseCase = async (serviceId: string): Promise<void> => {
    try {
        await serviceRepository.deleteService(serviceId);
    } catch (error:any) {
        console.error("Error deleting service in use case:", error.message);
        throw new Error("Failed to delete service.");
    }
};