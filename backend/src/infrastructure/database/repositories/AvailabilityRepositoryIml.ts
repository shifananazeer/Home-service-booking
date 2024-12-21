// infrastructure/repositories/availabilityRepositoryImpl.ts

import mongoose from "mongoose";
import { Availability } from "../../../domain/entities/Availability";
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
    async getAllAvailabilityByWorkerId(workerId: string): Promise<Availability[]> {
        const availabilities = await AvailabilityModel.find({ workerId: new mongoose.Types.ObjectId(workerId) });
        return availabilities.map(avail => avail.toObject());
    },
};
