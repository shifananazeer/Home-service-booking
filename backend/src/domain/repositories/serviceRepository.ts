import { Service } from "../entities/Service";

export interface ServiceRepository {
    createService(data: Partial<Service>): Promise<Service>;
}