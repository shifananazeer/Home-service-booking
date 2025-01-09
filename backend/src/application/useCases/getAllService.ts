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



