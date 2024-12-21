// domain/repositories/availabilityRepository.ts

import { Availability } from "../entities/Availability";

export interface AvailabilityRepository {
    createAvailability(workerId: string, date: Date, slots: any[]): Promise<Availability>;
    getAvailability(workerId: string, date: Date): Promise<Availability | null>;
    updateAvailability(id: string, slots: any[]): Promise<Availability>; // New method for updating availability
    deleteExpiredSlots(currentDate: Date): Promise<void>; 
    getAllAvailabilityByWorkerId(workerId: string): Promise<Availability[]>;
}
