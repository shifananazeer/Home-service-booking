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
    }
}