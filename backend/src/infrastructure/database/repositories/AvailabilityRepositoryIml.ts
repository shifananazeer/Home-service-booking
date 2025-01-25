import mongoose from "mongoose";
import { startOfDay, endOfDay } from "date-fns";
import { Availability, AvailabilitySlot } from "../../../domain/entities/Availability";
import { AvailabilityRepository } from "../../../domain/repositories/availabilityRepository";
import AvailabilityModel from "../models/availabilityModel";
import moment from "moment";

export class AvailabilityRepositoryImpl implements AvailabilityRepository {
    async createAvailability(workerId: string, date: Date, slots: any[]): Promise<Availability> {
        const availability = await AvailabilityModel.create({ workerId, date, slots });
        console.log("availability", availability);
        return availability.toObject();
    }

    async getAvailability(workerId: string, date: Date): Promise<Availability | null> {
        const availability = await AvailabilityModel.findOne({
            workerId: new mongoose.Types.ObjectId(workerId),
            date: { $eq: date },
        });
        console.log("availability", availability);
        return availability ? availability.toObject() : null;
    }

    async updateAvailability(id: string, slots: any[]): Promise<Availability> {
        const updatedAvailability = await AvailabilityModel.findByIdAndUpdate(
            id,
            { slots },
            { new: true, runValidators: true }
        );

        if (!updatedAvailability) {
            throw new Error("Availability not found");
        }

        return updatedAvailability.toObject();
    }

    async deleteExpiredSlots(currentDate: Date): Promise<void> {
        await AvailabilityModel.deleteMany({ date: { $lt: currentDate } });
    }

    async getAllAvailabilityByWorkerId(workerId: string, skip: number, limit: number): Promise<Availability[]> {
      

        // Fetch all availabilities from the database for the given worker
        const availabilities = await AvailabilityModel.find({ workerId: new mongoose.Types.ObjectId(workerId) })
            .exec(); // Fetch all slots first
    
        // Get the current date
        const now = moment();
    
        // Filter the availabilities to return only valid slots (e.g., not in the past)
        const validAvailabilities = availabilities.filter(avail => moment(avail.date).isSameOrAfter(now, 'day'));
    
        // Slice the valid availabilities to apply pagination
        const result = validAvailabilities.slice(skip, skip + limit);
    
        // Return the valid slots (up to the limit)
        return result.map(avail => avail.toObject());
    }

    async updateSlot(slotId: string, updateData: Partial<AvailabilitySlot>): Promise<AvailabilitySlot> {
        const updatedAvailability = await AvailabilityModel.findOneAndUpdate(
            { "slots.slotId": slotId },
            {
                $set: {
                    "slots.$.startTime": updateData.startTime,
                    "slots.$.endTime": updateData.endTime,
                    "slots.$.isAvailable": updateData.isAvailable,
                },
            },
            { new: true }
        );

        if (!updatedAvailability) {
            throw new Error(`Slot with ID ${slotId} not found`);
        }

        const updatedSlot = updatedAvailability.slots.find(slot => slot.slotId === slotId);

        if (!updatedSlot) {
            throw new Error(`Failed to retrieve updated slot with ID ${slotId}`);
        }

        return updatedSlot;
    }

    async countAvailableSlots(workerId: string): Promise<number> {
        const now = moment();

        // Count valid slots based on the workerId
        const count = await AvailabilityModel.countDocuments({
            workerId,
            date: { $gte: now.toDate() } // Assuming `date` is the field representing the availability date
        });
    
        return count;
    }

    async deleteSlot(slotId: string): Promise<boolean | null> {
        const availability = await AvailabilityModel.findOne({ "slots.slotId": slotId });

        if (!availability) {
            return null;
        }

        availability.slots = availability.slots.filter(slot => slot.slotId !== slotId);
        await availability.save();
        return true;
    }

    async getAvailableSlots(workerId: string, date: Date): Promise<{ slots: any[] } | null> {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const availability = await AvailabilityModel.findOne(
            {
                workerId: new mongoose.Types.ObjectId(workerId),
                date: { $gte: startOfDay, $lt: endOfDay },
            },
            { slots: 1 }
        );

        return availability ? { slots: availability.slots } : null;
    }

    async updateSlotStatus(slotId: string): Promise<void> {
        try {
            await AvailabilityModel.updateOne(
                { "slots.slotId": slotId },
                { $set: { "slots.$.isAvailable": false } }
            );
        } catch (error) {
            console.error("Error updating slot status:", error);
            throw new Error("Could not update slot status");
        }
    }
    async findSlotsByDate(date:string) {
        const startDate = startOfDay(new Date(date)); // Start of the day (2025-01-31T00:00:00.000Z)
  const endDate = endOfDay(new Date(date));  
        const slots =  await AvailabilityModel.find({
            date: { $gte: startDate, $lte: endDate }, // Match the entire day's range
          }).lean();
        console.log("slots by date " , slots)
        return slots
    }
}
