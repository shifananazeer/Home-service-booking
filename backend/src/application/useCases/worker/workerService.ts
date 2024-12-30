import { WorkerRepositoryImpl } from "../../../infrastructure/database/repositories/WorkerRepositoryImpl";
import { Worker } from "../../../domain/entities/worker";
import {Booking} from  '../../../domain/entities/Booking'
import { BookingRepositoryImpl } from "../../../infrastructure/database/repositories/BookingRepositoryImpl";
import { AddressRepositoryImpl } from "../../../infrastructure/database/repositories/AddressRepositoryIml";
import { Address } from "../../../domain/entities/Address";

export const workerService = async (skill: string | undefined): Promise<Worker[]> => { 
    if (!skill) {
        throw new Error('Skill is required');
    }

    const workers = await WorkerRepositoryImpl.findWorkersBySkill(skill);

    if (workers.length === 0) {
        throw new Error('No workers found with this skill');
    }

    return workers; 
};


export const getBookingsByWorkerId = async (workerId: string, page: number , limit: number ): Promise<{ bookings: Booking[], total: number }> => {
    // Fetch bookings from the repository
    const bookings = await BookingRepositoryImpl.findBookingsByWorkerId(workerId, page, limit);
    // Count the total number of bookings for the worker
    const totalBookings = await BookingRepositoryImpl.countBookingsByWorkerId(workerId);
    
    return {
        bookings,
        total: totalBookings // Return the total count for pagination
    };
};


interface AddressResponse {
    message: string;
    address?: {
        id?: string;
        userId: string;
        address: string;
        area: string;
        latitude?: number; // Optional latitude
        longitude?: number; // Optional longitude
        __v?: number;
    };
}

export const singleWorker = async (workerId:string) :Promise<AddressResponse>  => {
     const address: Address | null = await AddressRepositoryImpl.findAddressByWorkerId(workerId);
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
            latitude: address.location?.latitude, // Fetch latitude
             longitude: address.location?.longitude, // Fetch longitude
            __v: address.__v,
        },
    }
}

export const fetchTodaysBookings = async (workerId:string) : Promise<Booking[]|[]> => {
    if (!workerId) {
        throw new Error('Worker ID is required');
      }
    
      const bookings = await BookingRepositoryImpl.getTodaysBookingsByWorker(workerId);
    
      return bookings||[];
}