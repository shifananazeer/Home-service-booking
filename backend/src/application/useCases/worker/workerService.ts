import { WorkerRepositoryImpl } from "../../../infrastructure/database/repositories/WorkerRepositoryImpl";
import { Worker } from "../../../domain/entities/worker";
import {Booking} from  '../../../domain/entities/Booking'
import {BookingRepositoryImpl} from "../../../infrastructure/database/repositories/BookingRepositoryImpl";
import { AddressRepositoryImpl } from "../../../infrastructure/database/repositories/AddressRepositoryIml";
import { Address } from "../../../domain/entities/Address";
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