import { Service } from "../../../domain/entities/Service";
import { ServiceRepository } from "../../../domain/repositories/serviceRepository";
import ServiceModel from "../models/serviceModel";

export const ServiceRepositoryImpl: ServiceRepository = {
    async createService(data: Partial<Service>): Promise<Service> {
        const newService = new ServiceModel(data);
        const savedService = await newService.save();
        return savedService;
    },
};