import { AvailabilityRepositoryImpl } from "../../../infrastructure/database/repositories/AvailabilityRepositoryIml"
import { AvailabilityRepository } from "../../../domain/repositories/availabilityRepository";
import { Availability, AvailabilitySlot } from "../../../domain/entities/Availability";
import mongoose from "mongoose";
export const createAvailability = async ( repository: AvailabilityRepository,workerId :string , date:Date ,slots:any[] ):Promise <Availability> => {
  if(!workerId || !date || !Array.isArray(slots))  {
    throw new Error ("Invalid input data")
  }
  console.log("date")
  const workerObjectId = new mongoose.Types.ObjectId(workerId);
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const existingAvailability = await repository.getAvailability(workerId, normalizedDate);
  console.log("date",date)
  console.log("existing",existingAvailability)
  if (existingAvailability) {
    // Document exists, so add the new slots to the existing slots array
    existingAvailability.slots.push(...slots); // Spread operator to add new slots
    if (!existingAvailability._id) {
        throw new Error("Availability ID is missing");
      }
    return await repository.updateAvailability(existingAvailability._id, existingAvailability.slots);
  } else {
    // No existing document, create a new availability
    return await repository.createAvailability(workerObjectId.toString(),normalizedDate, slots);
  }
}

export const availableSlots = async (
  availabilityRepository: AvailabilityRepository,
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



export const updateSlot = async (
    slotId: string,
    updateData: Partial<AvailabilitySlot>,
    availabilityRepository: AvailabilityRepository
): Promise<AvailabilitySlot> => {
    // Call the repository method to update the slot
    const updatedSlot = await availabilityRepository.updateSlot(slotId, updateData);
    return updatedSlot;
};

export const deleteSlot = async(slotId:string) => {
  if (!slotId) {
    throw new Error("Slot ID is required");
}

// Call the repository method to delete the slot
const result = await AvailabilityRepositoryImpl.deleteSlot(slotId);

// Handle the result if needed
if (result === null) {
    throw new Error("Availability not found for the provided slot ID");
}

return result; // Return true if deletion was successful

}