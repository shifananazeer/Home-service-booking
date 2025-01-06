import { Booking } from "../../../domain/entities/Booking";
import {BookingRepositoryImpl} from "../../../infrastructure/database/repositories/BookingRepositoryImpl";

interface FetchAllBookingsParams {
    page: number;
    limit: number;
    search: string;
}

export class BookingManagement {
    private bookingRepository: BookingRepositoryImpl;

    constructor() {
        this.bookingRepository = new BookingRepositoryImpl();
    }

   public async fetchAllBookings(params: FetchAllBookingsParams): Promise<{ bookings: Booking[]; total: number }> {
        const { page, limit, search } = params;
        try {
            return await this.bookingRepository.getAllBookings({ page, limit, search });
        } catch (error) {
            console.error("Error in FetchAllBookingsUseCase:", error);
            throw new Error("Failed to fetch bookings");
        }
    }
}
