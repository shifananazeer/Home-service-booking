// infrastructure/repositories/availabilityRepositoryImpl.ts

import mongoose from "mongoose";
import { Availability, AvailabilitySlot } from "../../../domain/entities/Availability";
import { AvailabilityRepository } from "../../../domain/repositories/availabilityRepository";
import AvailabilityModel from "../models/availabilityModel";

export const AvailabilityRepositoryImpl: AvailabilityRepository = {
    async createAvailability(workerId: string, date: Date, slots: any[]): Promise<Availability> {
        const availability = await AvailabilityModel.create({ workerId, date, slots });
        return availability.toObject();
    },

    async getAvailability(workerId: string, date: Date): Promise<Availability | null> {
        const availability = await AvailabilityModel.findOne({
            workerId: new mongoose.Types.ObjectId(workerId),
            date: { $eq: date }, // Use strict equality check
          });
        return availability ? availability.toObject() : null;
      },
    async updateAvailability(id: string, slots: any[]): Promise<Availability> {
        const updatedAvailability = await AvailabilityModel.findByIdAndUpdate(
            id,
            { slots },
            { new: true, runValidators: true } // Options: return the updated document and run validators
        );

        if (!updatedAvailability) {
            throw new Error("Availability not found");
        }

        return updatedAvailability.toObject();
    },
    async deleteExpiredSlots(currentDate: Date): Promise<void> {
        // Assuming your Availability schema has a date field to check against the current date
        await AvailabilityModel.deleteMany({ date: { $lt: currentDate } });
    },
    async getAllAvailabilityByWorkerId(workerId: string, skip: number, limit: number): Promise<Availability[]> {
        const availabilities = await AvailabilityModel.find({ workerId: new mongoose.Types.ObjectId(workerId) })
            .skip(skip) // Skip documents for pagination
            .limit(limit) // Limit the number of documents returned
            .exec(); // Execute the query
    
        return availabilities.map(avail => avail.toObject());
    },
    async updateSlot(slotId: string, updateData: Partial<AvailabilitySlot>): Promise<AvailabilitySlot> {
        const updatedAvailability = await AvailabilityModel.findOneAndUpdate(
            { "slots.slotId": slotId }, // Match the specific slot within the slots array
            {
                $set: {
                    "slots.$.startTime": updateData.startTime,
                    "slots.$.endTime": updateData.endTime,
                    "slots.$.isAvailable": updateData.isAvailable,
                },
            },
            { new: true } // Return the updated document
        );

        if (!updatedAvailability) {
            throw new Error(`Slot with ID ${slotId} not found`);
        }

        // Find and return the updated slot
        const updatedSlot = updatedAvailability.slots.find(slot => slot.slotId === slotId);

        if (!updatedSlot) {
            throw new Error(`Failed to retrieve updated slot with ID ${slotId}`);
        }

        return updatedSlot;
    },
    async countAvailableSlots(workerId: string): Promise<number> {
        return await AvailabilityModel.countDocuments({ workerId });
    },
    async deleteSlot(slotId: string): Promise<boolean | null> {
        const availability = await AvailabilityModel.findOne({ "slots.slotId": slotId });

        if (!availability) {
            return null; // Availability not found
        }

        // Filter out the slot from the slots array
        availability.slots = availability.slots.filter(slot => slot.slotId !== slotId);

        // Save the updated availability document
        await availability.save();

        return true; // Return true if deletion was successful
    }

};
