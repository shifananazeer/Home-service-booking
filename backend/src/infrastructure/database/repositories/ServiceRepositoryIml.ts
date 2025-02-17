import { Service } from "../../../domain/entities/Service";
import { ServiceRepository } from "../../../domain/repositories/serviceRepository";
import ServiceModel from "../models/serviceModel";

export class ServiceRepositoryImpl implements ServiceRepository {
    async createService(data: Partial<Service>): Promise<Service> {
        const newService = new ServiceModel(data);
        const savedService = await newService.save();
        return savedService.toObject() as Service;
    }

    async updateService(serviceId: string, data: Partial<Service>): Promise<Service | null> {
        const updatedService = await ServiceModel.findByIdAndUpdate(serviceId, data, { new: true });
        return updatedService ? updatedService.toObject() as Service : null;
    }

    async deleteService(serviceId: string): Promise<void> {
        await ServiceModel.findByIdAndDelete(serviceId);
    }

    async getAllServices(): Promise<Service[]> {
        try {
            const allServices = await ServiceModel.find();
            return allServices.map((service) => service.toObject() as Service);
        } catch (error) {
            console.error('Database error while fetching services:', error);
            throw new Error('Unable to fetch services from the database');
        }
    }
}
