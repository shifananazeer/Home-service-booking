import { AvailabilityRepositoryImpl } from "../../../infrastructure/database/repositories/AvailabilityRepositoryIml"
import { AvailabilityRepository } from "../../../domain/repositories/availabilityRepository";
import { Availability } from "../../../domain/entities/Availability";
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

export const availableSlots = async (availabilityRepository: AvailabilityRepository, workerId:string) => {
    const availabilities = await availabilityRepository.getAllAvailabilityByWorkerId(workerId);
    
    if (!availabilities || availabilities.length === 0) {
        throw new Error("No available slots found for this worker.");
    }

    return availabilities;
}

