

import { Availability, AvailabilitySlot } from "../entities/Availability";

export interface AvailabilityRepository {
    createAvailability(workerId: string, date: Date, slots: any[]): Promise<Availability>;
    getAvailability(workerId: string, date: Date): Promise<Availability | null>;
    updateAvailability(id: string, slots: any[]): Promise<Availability>; 
    deleteExpiredSlots(currentDate: Date): Promise<void>; 
    getAllAvailabilityByWorkerId(workerId: string , skip : number , limit: number ): Promise<Availability[]>;
    updateSlot(slotId: string, updateData: Partial<AvailabilitySlot>): Promise<AvailabilitySlot>;
    countAvailableSlots(workerId: string): Promise<number>;
    deleteSlot(slotId: string): Promise<boolean | null>;
    getAvailableSlots(workerId: string, date: Date): Promise <{ slots: any[] } | null>;
    updateSlotStatus(slotId:string) :Promise<void>;
}
