import { Booking } from "../../../domain/entities/Booking";
import { AdminRepository } from "../../../domain/repositories/adminRepository"

export const fetchAllBookings = async (
    adminRepository: AdminRepository
): Promise<Booking[]> => {
    return await adminRepository.getBookings();
};
