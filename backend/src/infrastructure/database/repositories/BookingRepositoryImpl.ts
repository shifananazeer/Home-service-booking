import mongoose, { Types } from "mongoose";
import { Booking } from "../../../domain/entities/Booking";
import { BookingRepository, WorkerBookingCount } from "../../../domain/repositories/bookingRepository";
import BookingModel from "../models/bookingModel";

export class BookingRepositoryImpl implements BookingRepository {
    async bookingDetailsUpdate(bookingDetails: Booking): Promise<Booking> {
        try {
            const createdBooking = await BookingModel.create(bookingDetails);
            return createdBooking;
        } catch (error) {
            console.error('Error updating booking details:', error);
            throw new Error('Failed to update booking details'); 
        }
    }

    async getBookingsForUser(userId: string , page: number, limit: number): Promise<Booking[]> {
        const skip = (page - 1) * limit; 
        try {
            const bookings = await BookingModel.find({ userId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }) 
            .exec();
            return bookings;
        } catch (error) {
            console.error('Error fetching bookings for user:', error);
            return [];
        }
    }

    async countBookingsByUserId(userId: string): Promise<number> {
        return await BookingModel.countDocuments({ userId }).exec(); 
    }

    async findBookingsByWorkerId(workerId: string, page: number, limit: number): Promise<Booking[]> {
        const skip = (page - 1) * limit; 
        return await BookingModel.find({ workerId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }) 
            .exec();
    }

    async countBookingsByWorkerId(workerId: string): Promise<number> {
        return await BookingModel.countDocuments({ workerId }).exec(); 
    }

    async cancelUpdate(bookingId: string): Promise<Booking | null> {
        try {
            const updatedBooking = await BookingModel.findByIdAndUpdate(
                bookingId,
                { paymentStatus: "Cancelled" }, 
                { new: true } 
            ).exec();
            return updatedBooking;
        } catch (error) {
            console.error("Error cancelling booking:", error);
            throw new Error("Failed to cancel booking");
        }
    }

    async getTodaysBookingsByWorker(workerId: string): Promise<Booking[]> {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        return await BookingModel.find({
            workerId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        });
    }

    async getAllBookings(params: { page: number; limit: number; search: string }): Promise<{ bookings: Booking[]; total: number }> {
        const { page, limit, search } = params;
    
        const skip = (page - 1) * limit; 
        const query = search ? { bookingId: { $regex: search, $options: 'i' } } : {};
        const total = await BookingModel.countDocuments(query);
        const bookings = await BookingModel.find(query)
            .populate('userId', 'name email') 
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit); 
    
        return { bookings, total };
    }

    async getBookingById (bookingId:string) : Promise<Booking| null> {
        const details = await BookingModel.findOne({bookingId});
        console.log("details" , details)
        return details;
    }
    async getBookingByIdForInvoice (bookingId:string) : Promise<Booking | null> {
        const details = await BookingModel.findOne({ bookingId })
            .populate({
                path: "userId",
                select: "firstName email",
            })
            .lean(); // Returns plain JS object
    
        if (!details) {
            return null;
        }
    
        // Explicitly casting the plain object to the `Booking` type if necessary
        return details as Booking; 
    }

    async updatePayment (bookingId:string , status:string) : Promise<void> {
        await BookingModel.findOneAndUpdate({bookingId},{paymentStatus:status}, { new: true })
    }

    async markBookingAsCompleted (bookingId:string) :Promise<Booking| null> {
        try {
            const booking = await BookingModel.findByIdAndUpdate(
                bookingId,
                { workStatus: 'completed' },
                { new: true } 
            );
            return booking;
        } catch (error) {
            console.error('Error in BookingRepository:', error);
            throw error; 
        }
    }

    async fetchBookigsByUserId(userId:string) : Promise <Booking[]> {
        try{
          const bookings = await BookingModel.find({ userId: new mongoose.Types.ObjectId(userId) })
          return bookings;
        }catch(error) {
           console.log("error fetching bookings")
         return [];
        }
    }

    async findBalanceAmount (bookingId:string) :Promise < number| null> {
        const booking = await BookingModel.findOne({ bookingId : bookingId});
        if (!booking) {
            console.error(`Booking with ID ${bookingId} not found.`);
            return null;
        }
        return booking.balancePayment;
    }
    async findBookings (bookingId:string) :Promise <Booking| null> {
        const bookings = await BookingModel.findOne({_id:bookingId})
        if (!bookings) {
            console.error(`Booking with ID ${bookingId} not found.`);
            return null;
        }
        return bookings;

    }

    async getCount(workerId: string, timeFrame: string) {
        const workerObjectId = new mongoose.Types.ObjectId(workerId);
    
        const matchCriteria: any = {
            workerId: workerObjectId,
            paymentStatus: { $ne: "Cancelled" } 
        };
    
        const currentDate = new Date();
        let groupStage: any = {};
    
        if (timeFrame === "weekly") {
            groupStage = { _id: { $dayOfWeek: "$createdAt" }, totalCount: { $sum: 1 } };
        } else if (timeFrame === "monthly") {
            groupStage = { _id: { $month: "$createdAt" }, totalCount: { $sum: 1 } };
        } else if (timeFrame === "yearly") {
            groupStage = { _id: { $year: "$createdAt" }, totalCount: { $sum: 1 } };
        }
    
        const result = await BookingModel.aggregate([
            { $match: matchCriteria },
            { $group: groupStage },
            { $sort: { _id: 1 } }
        ]);
    
        return result;
    }


    async getWorkerRevenue(workerId: string, startDate: Date, endDate: Date, groupBy: string) {
        let dateFormat: any = {};

        if (groupBy === "daily") dateFormat = { year: "$year", month: "$month", day: "$day" };
        else if (groupBy === "weekly") dateFormat = { year: "$year", week: "$week" };
        else if (groupBy === "monthly") dateFormat = { year: "$year", month: "$month" };
        else if (groupBy === "yearly") dateFormat = { year: "$year" };

        return await BookingModel.aggregate([
            {
                $match: {
                    workerId: new mongoose.Types.ObjectId(workerId),
                    workStatus: "completed",
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $project: {
                    advancePayment: 1,
                    balancePayment: 1,
                    totalPayment: { $add: ["$advancePayment", "$balancePayment"] },
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    week: { $week: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" }
                }
            },
            {
                $group: {
                    _id: dateFormat,
                    totalRevenue: { $sum: "$totalPayment" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);
    }

    async getBookedSkillsByWorker(workerId: string): Promise<{ skill: string; count: number }[]> {
        const results = await BookingModel.aggregate([
            { $match: { workerId: new Types.ObjectId(workerId) } },
            {
                $group: {
                    _id: "$serviceName", 
                    count: { $sum: 1 } 
                }
            },
            { $sort: { count: -1 } } 
        ]);
    
        return results.map(item => ({
            skill: item._id,
            count: item.count
        }));
    }


    async getFullCount( timeFrame: string) {
       
    
        const matchCriteria: any = {
            paymentStatus: { $ne: "Cancelled" } 
        };
    
        const currentDate = new Date();
        let groupStage: any = {};
    
        if (timeFrame === "weekly") {
            groupStage = { _id: { $dayOfWeek: "$createdAt" }, totalCount: { $sum: 1 } };
        } else if (timeFrame === "monthly") {
            groupStage = { _id: { $month: "$createdAt" }, totalCount: { $sum: 1 } };
        } else if (timeFrame === "yearly") {
            groupStage = { _id: { $year: "$createdAt" }, totalCount: { $sum: 1 } };
        }
    
        const result = await BookingModel.aggregate([
            { $match: matchCriteria },
            { $group: groupStage },
            { $sort: { _id: 1 } }
        ]);
    
        return result;
    }

    async getMostBookServices(limit: number = 5): Promise<{ skill: string; count: number }[]> {
        const popularServices = await BookingModel.aggregate([
            {
                $group: {
                    _id: "$serviceName", // Group by service name
                    count: { $sum: 1 } // Count how many times each service appears
                }
            },
            { $sort: { count: -1 } }, // Sort in descending order
            { $limit: limit } // Get top X results
        ]);

        return popularServices.map((service: { _id: any; count: any; }) => ({
            skill: service._id, // _id contains the service name
            count: service.count
        }));
    }

    async getMostBookedWorkers(limit: number = 5): Promise<WorkerBookingCount[]> { 
        const workers = await BookingModel.aggregate([
            {
                $group: {
                    _id: "$workerId",
                    count: { $sum: 1 },
                    workerName: { $first: "$workerName" }
                },
            },
            {
                $lookup: {
                    from: "workers", // The collection name in MongoDB
                    localField: "_id",
                    foreignField: "_id",
                    as: "workerInfo"
                }
            },
            {
                $unwind: "$workerInfo" // Convert the array into an object
            },
            { $sort: { count: -1 } }, // Sort by highest bookings
            { $limit: limit }, // Limit results
            {
                $project: {
                    workerId: "$_id",
                    workerName: 1,
                    profilePic: "$workerInfo.profilePic", // Get profile picture from Worker collection
                    bookingsCount: "$count"
                }
            }
        ]);
    
        return workers.map(worker => ({
            workerId: worker.workerId.toString(),
            workerName: worker.workerName,
            profilePic: worker.profilePic, // Replacing serviceImage with profilePic
            bookingsCount: worker.bookingsCount
        }));
    }
}    
