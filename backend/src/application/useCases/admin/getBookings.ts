import { Booking } from "../../../domain/entities/Booking";
import BookingRepositoryImpl from "../../../infrastructure/database/repositories/BookingRepositoryImpl";

export const fetchAllBookings = async (
   
    page: number,
    limit: number,
    search: string
): Promise<{ bookings: Booking[]; total: number }> => {
    return await BookingRepositoryImpl.getAllBookings({ page, limit, search }); 
};