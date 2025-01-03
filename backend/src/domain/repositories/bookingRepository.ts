import { Booking } from "../entities/Booking";

export interface BookingRepository {
    bookingDetailsUpdate(userDetails:Booking) : Promise <Booking | null>;
    getBookingsForUser(userId:string) :Promise <Booking[]|[]>;
    findBookingsByWorkerId(workerId: string, page: number, limit: number) :Promise <Booking[]|[]>;
    countBookingsByWorkerId(workerId: string): Promise<number>;
    cancelUpdate(bookidId:string) :Promise<Booking|null>
    getTodaysBookingsByWorker(eorkrtId:string) :Promise<Booking[]|null>;
    getAllBookings(params: { page: number; limit: number; search: string }): Promise<{ bookings: Booking[]; total: number }>;
}