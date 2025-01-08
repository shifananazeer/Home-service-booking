import { AvailabilityRepositoryImpl } from "../../infrastructure/database/repositories/AvailabilityRepositoryIml";
import { Availability, AvailabilitySlot } from "../../domain/entities/Availability";
import mongoose from "mongoose";

export class AvailabilityService {
    private availabilityRepository: AvailabilityRepositoryImpl;

    constructor() {
        this.availabilityRepository = new AvailabilityRepositoryImpl();
    }

    public async createAvailability(
        workerId: string,
        date: Date,
        slots: { slotId: string; startTime: string; endTime: string; isAvailable: boolean }[]
    ): Promise<Availability> {
        if (!workerId || !date || !Array.isArray(slots)) {
            throw new Error("Invalid input data");
        }

        const workerObjectId = new mongoose.Types.ObjectId(workerId);
        const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const existingAvailability = await this.availabilityRepository.getAvailability(workerId, normalizedDate);

        if (existingAvailability) {
            if (!existingAvailability._id) {
                throw new Error("Availability ID is missing");
            }
            const existingSlots = existingAvailability.slots;
            const conflictingSlot = slots.find((newSlot) =>
                existingSlots.some((existingSlot: any) => {
                    return (
                        existingSlot.slotId === newSlot.slotId || 
                        this.areSlotsOverlapping(existingSlot.startTime, existingSlot.endTime, newSlot.startTime, newSlot.endTime)
                    );
                })
            );

            if (conflictingSlot) {
                throw new Error(
                    `Conflicting slot already exists for time range ${conflictingSlot.startTime} - ${conflictingSlot.endTime}`
                );
            }
            existingAvailability.slots.push(...slots);
            return await this.availabilityRepository.updateAvailability(
                existingAvailability._id,
                existingAvailability.slots
            );
        } else {
            return await this.availabilityRepository.createAvailability(workerObjectId.toString(), normalizedDate, slots);
        }
    }
    private areSlotsOverlapping(
        start1: string,
        end1: string,
        start2: string,
        end2: string
    ): boolean {
        const [startHour1, startMinute1] = start1.split(':').map(Number);
        const [endHour1, endMinute1] = end1.split(':').map(Number);
        const [startHour2, startMinute2] = start2.split(':').map(Number);
        const [endHour2, endMinute2] = end2.split(':').map(Number);

        const start1Time = startHour1 * 60 + startMinute1;
        const end1Time = endHour1 * 60 + endMinute1;
        const start2Time = startHour2 * 60 + startMinute2;
        const end2Time = endHour2 * 60 + endMinute2;

        return start1Time < end2Time && start2Time < end1Time;
    }

    public async availableSlots(workerId: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;
            return await this.availabilityRepository.getAllAvailabilityByWorkerId(workerId, skip, limit);
        } catch (error) {
            console.error("Error fetching available slots:", error);
            throw new Error("Could not fetch available slots.");
        }
    }

    public async updateSlot(slotId: string, updateData: Partial<AvailabilitySlot>): Promise<AvailabilitySlot> {
        return await this.availabilityRepository.updateSlot(slotId, updateData);
    }

    public async deleteSlot(slotId: string) {
        if (!slotId) {
            throw new Error("Slot ID is required");
        }
        const result = await this.availabilityRepository.deleteSlot(slotId);
        if (result === null) {
            throw new Error("Availability not found for the provided slot ID");
        }
        return result;
    }

    public async fetchAvailableSlots(workerId: string, date: Date): Promise<any[]> {
        try {
            const availability = await this.availabilityRepository.getAvailableSlots(workerId, date);
            return availability ? availability.slots : [];
        } catch (err) {
            console.error("Error in fetchAvailableSlots:", err);
            throw new Error("Error fetching available slots");
        }
    }

    public async updateStatusOfSlot(slotId: string) {
        await this.availabilityRepository.updateSlotStatus(slotId);
    }

    public async availableSlotsUseCase(workerId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;
        const availabilities = await this.availabilityRepository.getAllAvailabilityByWorkerId(workerId, skip, limit);

        const totalCount = await this.availabilityRepository.countAvailableSlots(workerId);

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
        };

        return { availabilities, pagination };
    }
}



