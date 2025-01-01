import { Booking } from "../../../domain/entities/Booking";
import { AdminRepository } from "../../../domain/repositories/adminRepository"

export const fetchAllBookings = async (
    adminRepository: AdminRepository,
    page: number,
    limit: number,
    search: string
): Promise<{ bookings: Booking[]; total: number }> => {
    return await adminRepository.getBookings({ page, limit, search }); 
};