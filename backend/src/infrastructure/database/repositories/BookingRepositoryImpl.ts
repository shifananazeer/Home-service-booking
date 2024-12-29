import { Booking } from "../../../domain/entities/Booking";
import { BookingRepository } from "../../../domain/repositories/bookingRepository";
import BookingModel from "../models/bookingModel";

export const BookingRepositoryImpl : BookingRepository = {
    async bookingDetailsUpdate(bookingDetails: Booking): Promise<Booking> {
        try {
            const createdBooking = await BookingModel.create(bookingDetails);
            return createdBooking;
        } catch (error) {
            console.error('Error updating booking details:', error);
            throw new Error('Failed to update booking details'); 
        }
    },
    async getBookingsForUser(userId: string): Promise<Booking[] | []> {
        try {
            const bookings = await BookingModel.find({ userId });
            return bookings;
        } catch (error) {
            console.error('Error fetching bookings for user:', error);
            return [];
        }
    },
    async findBookingsByWorkerId(workerId: string, page: number, limit: number): Promise<Booking[]> {
        const skip = (page - 1) * limit; // Calculate how many records to skip
        return await BookingModel.find({ workerId })
            .skip(skip)
            .limit(limit)
            .exec(); // Execute the query
    },
    
    async countBookingsByWorkerId(workerId: string): Promise<number> {
        return await BookingModel.countDocuments({ workerId }).exec(); // Get total count of bookings
    }
}