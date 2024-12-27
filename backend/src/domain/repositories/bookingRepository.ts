import { Booking } from "../entities/Booking";

export interface BookingRepository {
    bookingDetailsUpdate(userDetails:Booking) : Promise <Booking | null>;
    getBookingsForUser(userId:string) :Promise <Booking[]|[]>
}