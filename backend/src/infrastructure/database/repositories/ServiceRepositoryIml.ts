import { Service } from "../../../domain/entities/Service";
import { ServiceRepository } from "../../../domain/repositories/serviceRepository";
import ServiceModel from "../models/serviceModel";

export const ServiceRepositoryImpl: ServiceRepository = {
    async createService(data: Partial<Service>): Promise<Service> {
        const newService = new ServiceModel(data);
        const savedService = await newService.save();
        return savedService;
    },
    async updateService(serviceId: string, data: Partial<Service>): Promise<Service | null> {
        const updatedService = await ServiceModel.findByIdAndUpdate(serviceId, data, { new: true });
        return updatedService;
    },
    async deleteService(serviceId: string): Promise<void> {
        await ServiceModel.findByIdAndDelete(serviceId); // Use the service model to delete by ID
    },
    async getAllServices(): Promise<Service[]> {
        try {
            const allService = await ServiceModel.find();
            return allService;
        } catch (error) {
            console.error('Database error while fetching services:', error);
            throw new Error('Unable to fetch services from the database');
        }
    }
};