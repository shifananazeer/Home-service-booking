import { AvailabilityRepositoryImpl } from "../../../infrastructure/database/repositories/AvailabilityRepositoryIml"
import { AvailabilityRepository } from "../../../domain/repositories/availabilityRepository";
import { Availability, AvailabilitySlot } from "../../../domain/entities/Availability";
import mongoose from "mongoose";

const availabilityRepository = new AvailabilityRepositoryImpl();


export const createAvailability = async (
  workerId: string,
  date: Date,
  slots: { slotId: string; startTime: string; endTime: string; isAvailable: boolean }[]
): Promise<Availability> => {
  if (!workerId || !date || !Array.isArray(slots)) {
      throw new Error("Invalid input data");
  }

  const workerObjectId = new mongoose.Types.ObjectId(workerId);
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const existingAvailability = await availabilityRepository.getAvailability(workerId, normalizedDate);

  if (existingAvailability) {
    if (!existingAvailability._id) {
      throw new Error("Availability ID is missing");
    }
      const existingSlots = existingAvailability.slots;

      // Check for duplicate or conflicting slots
      const conflictingSlot = slots.find((newSlot) =>
          existingSlots.some((existingSlot: any) => {
              return (
                  existingSlot.slotId === newSlot.slotId || // Duplicate slotId
                  areSlotsOverlapping(existingSlot.startTime, existingSlot.endTime, newSlot.startTime, newSlot.endTime)
              );
          })
      );

      if (conflictingSlot) {
          throw new Error(
              `Conflicting slot already exists for time range ${conflictingSlot.startTime} - ${conflictingSlot.endTime}`
          );
      }

      // Add non-conflicting slots
      existingAvailability.slots.push(...slots);
      return await availabilityRepository.updateAvailability(
          existingAvailability._id,
          existingAvailability.slots
      );
  } else {
      return await availabilityRepository.createAvailability(workerObjectId.toString(), normalizedDate, slots);
  }
};

// Utility function to check for overlapping slots
const areSlotsOverlapping = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const [startHour1, startMinute1] = start1.split(':').map(Number);
  const [endHour1, endMinute1] = end1.split(':').map(Number);
  const [startHour2, startMinute2] = start2.split(':').map(Number);
  const [endHour2, endMinute2] = end2.split(':').map(Number);

  const start1Time = startHour1 * 60 + startMinute1;
  const end1Time = endHour1 * 60 + endMinute1;
  const start2Time = startHour2 * 60 + startMinute2;
  const end2Time = endHour2 * 60 + endMinute2;

  return start1Time < end2Time && start2Time < end1Time;
};

export const availableSlots = async (

  workerId: string,
  page: number,
  limit: number
) => {
  try {
    const skip = (page - 1) * limit;
    return await availabilityRepository.getAllAvailabilityByWorkerId(workerId, skip, limit);
  } catch (error) {
    console.error("Error fetching available slots:", error);
    throw new Error("Could not fetch available slots.");
  }
};



export const updateSlot = async (slotId: string,updateData: Partial<AvailabilitySlot>): Promise<AvailabilitySlot> => {
    const updatedSlot = await availabilityRepository.updateSlot(slotId, updateData);
    return updatedSlot;
};

export const deleteSlot = async(slotId:string) => {
  if (!slotId) {
    throw new Error("Slot ID is required");
    }
const result = await availabilityRepository.deleteSlot(slotId);
if (result === null) {
    throw new Error("Availability not found for the provided slot ID");
}
return result;
}


export const fetchAvailableSlots = async (workerId: string, date: Date): Promise<any[]> => {
  try {
      const availability = await availabilityRepository.getAvailableSlots(workerId, date);
      return availability ? availability.slots : [];
  } catch (err) {
      console.error("Error in fetchAvailableSlots:", err);
      throw new Error("Error fetching available slots");
  }
};

export const updateStatusOfSlot = async (slotId:string) => {
     await availabilityRepository.updateSlotStatus(slotId)
}

export const availableSlotsUseCase = async (workerId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const availabilities = await availabilityRepository.getAllAvailabilityByWorkerId(workerId, skip, limit);

  const totalCount = await availabilityRepository.countAvailableSlots(workerId);

  const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
  };

  return { availabilities, pagination };
};
