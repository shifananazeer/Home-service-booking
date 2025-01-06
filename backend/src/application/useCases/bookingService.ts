import { WorkerRepositoryImpl } from "../../infrastructure/database/repositories/WorkerRepositoryImpl";
import { Worker } from "../../domain/entities/worker";
import {Booking} from  '../../domain/entities/Booking'
import {BookingRepositoryImpl} from "../../infrastructure/database/repositories/BookingRepositoryImpl";
import { AddressRepositoryImpl } from "../../infrastructure/database/repositories/AddressRepositoryIml";
import { Address } from "../../domain/entities/Address";
const addressRepository = new AddressRepositoryImpl();
const workerRepository = new WorkerRepositoryImpl();
const bookingRepository = new BookingRepositoryImpl();
// export const workerServices = async (skill: string | undefined): Promise<Worker[]> => { 
//     if (!skill) {
//         throw new Error('Skill is required');
//     }

//     const workers = await workerRepository.findWorkersBySkill(skill);

//     if (workers.length === 0) {
//         throw new Error('No workers found with this skill');
//     }

//     return workers; 
// };

interface FetchAllBookingsParams {
    page: number;
    limit: number;
    search: string;
}

export class BookingService {
    private bookingRepository: BookingRepositoryImpl;

    constructor() {
        this.bookingRepository = new BookingRepositoryImpl();
    }

    public async getBookingsByWorkerId(workerId: string, page: number, limit: number): Promise<{ bookings: Booking[]; total: number }> {
        const bookings = await this.bookingRepository.findBookingsByWorkerId(workerId, page, limit);
        const totalBookings = await this.bookingRepository.countBookingsByWorkerId(workerId);
        
        return {
            bookings,
            total: totalBookings
        };
    }

    public async fetchTodaysBookings(workerId: string): Promise<Booking[] | []> {
        if (!workerId) {
            throw new Error('Worker ID is required');
        }

        const bookings = await this.bookingRepository.getTodaysBookingsByWorker(workerId);

        return bookings || [];
    }

    public async createBooking(bookingDetails: Booking): Promise<Booking | null> {
        try {
            const createdBooking = await this.bookingRepository.bookingDetailsUpdate(bookingDetails);
            return createdBooking;
        } catch (error) {
            console.error("Error creating booking:", error);
            throw new Error("Failed to create booking");
        }
    }

    // Get bookings by user ID with pagination
    public async getBookingsByUserId(userId: string, page: number, limit: number): Promise<{ bookings: Booking[]; total: number }> {
        try {
            const bookings = await this.bookingRepository.getBookingsForUser(userId, page, limit);
            const totalBookings = await this.bookingRepository.countBookingsByUserId(userId);
            return { bookings, total: totalBookings };
        } catch (error) {
            console.error("Error fetching bookings:", error);
            throw new Error("Failed to fetch bookings");
        }
    }

    // Cancel a booking
    public async cancelBooking(bookingId: string): Promise<Booking | null> {
        try {
            const updatedBooking = await this.bookingRepository.cancelUpdate(bookingId);
            return updatedBooking;
        } catch (error) {
            console.error("Error updating booking status:", error);
            throw new Error("Failed to cancel booking");
        }
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



interface AddressResponse {
    message: string;
    address?: {
        id?: string;
        userId: string;
        address: string;
        area: string;
        latitude?: number; 
        longitude?: number; 
        __v?: number;
    };
}

export const singleWorker = async (workerId:string) :Promise<AddressResponse>  => {
    const address: Address | null = await addressRepository.findAddressByWorkerId(workerId);

    if (!address) {
        return {
            message: "User doesn't have an address",
        };
    }
    return {
        message: "Address retrieved successfully",
        address: {
           
            userId: address.userId.toString(), 
            address: address.address,
            area: address.area,
            latitude: address.location?.latitude, 
             longitude: address.location?.longitude, 
            __v: address.__v,
        },
    }
}

// export const fetchTodaysBookings = async (workerId:string) : Promise<Booking[]|[]> => {
//     if (!workerId) {
//         throw new Error('Worker ID is required');
//       }
    
//       const bookings = await bookingRepository.getTodaysBookingsByWorker(workerId);
    
//       return bookings||[];
// }