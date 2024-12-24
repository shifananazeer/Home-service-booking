import { Service } from "../entities/Service";

export interface ServiceRepository {
    createService(data: Partial<Service>): Promise<Service>;
    updateService(serviceId: string, data: Partial<Service>): Promise<Service | null>;
    deleteService(serviceId: string): Promise<void>;
    getAllServices():Promise<Service[]|null>
}