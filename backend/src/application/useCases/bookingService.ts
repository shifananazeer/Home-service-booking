import { WorkerRepositoryImpl } from "../../infrastructure/database/repositories/WorkerRepositoryImpl";
import { Worker } from "../../domain/entities/worker";
import {Booking} from  '../../domain/entities/Booking'
import {BookingRepositoryImpl} from "../../infrastructure/database/repositories/BookingRepositoryImpl";
import { AddressRepositoryImpl } from "../../infrastructure/database/repositories/AddressRepositoryIml";
import { Address } from "../../domain/entities/Address";


const addressRepository = new AddressRepositoryImpl();
const workerRepository = new WorkerRepositoryImpl();
const bookingRepository = new BookingRepositoryImpl();

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

        public async getBookingById (bookingId:string) : Promise< Booking | null>{
         try{
          const bookingDetails = await this.bookingRepository.getBookingById(bookingId)
          return bookingDetails;
         }catch (error) {
            console.error("Error fetching bookings:", error);
            throw new Error("Failed to fetch bookings");
         }
        }

        public async updateBookingById (bookingId:string , status:string) : Promise<void>{
            try{
             const bookingDetails = await this.bookingRepository.updatePayment(bookingId , status)
          
            }catch (error) {
               console.error("Error fetching bookings:", error);
               throw new Error("Failed to fetch bookings");
            }
           }
           public async workeStatusUpdate (bookingId:string) {
            const result = await this.bookingRepository.markBookingAsCompleted(bookingId);
            return result;
           }

           public async getBookingByUserId(userId:string) {
            const result = await this.bookingRepository.fetchBookigsByUserId(userId)
            return result ;
           }

           public async getBalance (bookingId:string) {
            const result = await this.bookingRepository.findBalanceAmount(bookingId) 
            return result;
           }

           public async getBookings(bookingId:string) {
            const result = await this.bookingRepository.findBookings(bookingId)
            return result;
           }

           public async getCountByWorker(workerId: string, timeFrame: string) {
            const result = await this.bookingRepository.getCount(workerId, timeFrame);
        
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
            const currentYear = new Date().getFullYear();
        
            if (timeFrame === "weekly") {
                return dayNames.map((day, index) => {
                    const foundData = result.find((data: { _id: number }) => data._id === index + 1);
                    return { label: day, count: foundData ? foundData.totalCount : 0 };
                });
            }
        
            if (timeFrame === "monthly") {
                return monthNames.map((month, index) => {
                    const foundData = result.find((data: { _id: number }) => data._id === index + 1);
                    return { label: month, count: foundData ? foundData.totalCount : 0 };
                });
            }
        
            if (timeFrame === "yearly") {
                return result.map((data: { _id: number; totalCount: number }) => ({
                    label: `${data._id}`,
                    count: data.totalCount
                }));
            }
        
            return [];
        }


        public async getWorkerRevenue(workerId: string, timeFrame: string) {
            let startDate = new Date();
            let endDate = new Date();
            let groupBy = "daily";
    
            switch (timeFrame) {
                case 'daily':
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = "daily";
                    break;
                case 'weekly':
                    startDate.setDate(startDate.getDate() - 7);
                    groupBy = "weekly";
                    break;
                case 'monthly':
                    startDate.setMonth(startDate.getMonth() - 1);
                    groupBy = "monthly";
                    break;
                case 'yearly':
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    groupBy = "yearly";
                    break;
                default:
                    throw new Error('Invalid time frame. Use daily, weekly, monthly, or yearly.');
            }
    
            const revenueData = await this.bookingRepository.getWorkerRevenue(workerId, startDate, endDate, groupBy);
    
            const labels = revenueData.map((data: any) => {
                if (groupBy === "daily") return `${data._id.day}/${data._id.month}`;
                if (groupBy === "weekly") return `Week ${data._id.week}, ${data._id.year}`;
                if (groupBy === "monthly") return `${data._id.month}/${data._id.year}`;
                if (groupBy === "yearly") return `${data._id.year}`;
            });
    
            const revenueValues = revenueData.map((data: any) => data.totalRevenue);
    
            return { labels, revenueValues };
        }

       public async getBookedSkills(workerId: string): Promise<{ skill: string; count: number }[]> {
            const bookedSkills = await this.bookingRepository.getBookedSkillsByWorker(workerId);
            return bookedSkills;
        }



        public async getCountByAdmin( timeFrame: string) {
            const result = await this.bookingRepository.getFullCount( timeFrame);
        
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
            const currentYear = new Date().getFullYear();
        
            if (timeFrame === "weekly") {
                return dayNames.map((day, index) => {
                    const foundData = result.find((data: { _id: number }) => data._id === index + 1);
                    return { label: day, count: foundData ? foundData.totalCount : 0 };
                });
            }
        
            if (timeFrame === "monthly") {
                return monthNames.map((month, index) => {
                    const foundData = result.find((data: { _id: number }) => data._id === index + 1);
                    return { label: month, count: foundData ? foundData.totalCount : 0 };
                });
            }
        
            if (timeFrame === "yearly") {
                return result.map((data: { _id: number; totalCount: number }) => ({
                    label: `${data._id}`,
                    count: data.totalCount
                }));
            }
        
            return [];
        }
        async getMostBookedServices(limit: number = 5) {
            return  await this.bookingRepository.getMostBookServices(limit);
           
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

