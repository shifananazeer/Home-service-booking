import { Booking } from "../../../domain/entities/Booking";
import { BookingRepositoryImpl } from "../../../infrastructure/database/repositories/BookingRepositoryImpl";

export const createBookings = async (bookingDetails: Booking): Promise<Booking |null> => {
    try {
        const createdBooking = await BookingRepositoryImpl.bookingDetailsUpdate(bookingDetails);
        return createdBooking; 
    } catch (error) {
        console.error('Error creating booking:', error);
        throw new Error('Failed to create booking'); 
    }
}

export const   getBookingsByUserId = async (userId:string) => {
    try{
        const getBookingsDeatils = await BookingRepositoryImpl.getBookingsForUser(userId)
        return getBookingsDeatils;
    }catch(error) {
        console.error('Error fetching bookings:', error);
       
    }
}