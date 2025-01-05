import { Booking } from "../../../domain/entities/Booking";
import  bookingRepository  from "../../../infrastructure/database/repositories/BookingRepositoryImpl";


export const createBookings = async (bookingDetails: Booking): Promise<Booking |null> => {
    try {
        const createdBooking = await bookingRepository.bookingDetailsUpdate(bookingDetails);
        return createdBooking; 
    } catch (error) {
        console.error('Error creating booking:', error);
        throw new Error('Failed to create booking'); 
    }
}

export const   getBookingsByUserId = async (userId:string , page: number , limit: number ) => {
    try{
        const getBookingsDeatils = await bookingRepository.getBookingsForUser(userId , page, limit)
        const totalBookings = await bookingRepository.countBookingsByUserId(userId);
        return getBookingsDeatils;
    }catch(error) {
        console.error('Error fetching bookings:', error);
       
    }
}

export const bookingCancelUpdate = async (bookingId: string): Promise<Booking | null> => {
    try {
        const updateBooking = await bookingRepository.cancelUpdate(bookingId);
        return updateBooking;
    } catch (error) {
        console.error("Error updating booking status:", error);
        throw new Error("Failed to cancel booking");
    }
};
