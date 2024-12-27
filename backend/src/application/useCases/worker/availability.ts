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
    existingAvailability.slots.push(...slots); 
    if (!existingAvailability._id) {
        throw new Error("Availability ID is missing");
      }
    return await repository.updateAvailability(existingAvailability._id, existingAvailability.slots);
  } else {
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



export const updateSlot = async (slotId: string,updateData: Partial<AvailabilitySlot>,availabilityRepository: AvailabilityRepository): Promise<AvailabilitySlot> => {
    const updatedSlot = await availabilityRepository.updateSlot(slotId, updateData);
    return updatedSlot;
};

export const deleteSlot = async(slotId:string) => {
  if (!slotId) {
    throw new Error("Slot ID is required");
    }
const result = await AvailabilityRepositoryImpl.deleteSlot(slotId);
if (result === null) {
    throw new Error("Availability not found for the provided slot ID");
}
return result;
}


export const fetchAvailableSlots = async (workerId: string, date: Date): Promise<any[]> => {
  try {
      const availability = await AvailabilityRepositoryImpl.getAvailableSlots(workerId, date);
      return availability ? availability.slots : [];
  } catch (err) {
      console.error("Error in fetchAvailableSlots:", err);
      throw new Error("Error fetching available slots");
  }
};