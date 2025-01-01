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
        const skip = (page - 1) * limit; 
        return await BookingModel.find({ workerId })
            .skip(skip)
            .limit(limit)
            .exec();
    },
    
    async countBookingsByWorkerId(workerId: string): Promise<number> {
        return await BookingModel.countDocuments({ workerId }).exec(); 
    },
    async cancelUpdate(bookingId: string): Promise<Booking | null> {
        try {
            const updatedBooking = await BookingModel.findByIdAndUpdate(
                bookingId,
                { paymentStatus: "Cancelled" }, 
                { new: true } 
            ).exec();
            return updatedBooking;
        } catch (error) {
            console.error("Error cancelling booking:", error);
            throw new Error("Failed to cancel booking");
        }
    },
 async getTodaysBookingsByWorker(workerId:string) :Promise <Booking[]|[]> {
   
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        return await BookingModel.find({
            workerId,
            date: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          });
 }
}