import mongoose, { Types } from "mongoose";
import { Ratings } from "../../../domain/entities/Rating";
import { RatingRepository } from "../../../domain/repositories/ratingRepository";
import RatingsModel from "../models/ratingsModel";

export class RatingRepositoryImpl implements RatingRepository {
async createRatings(ratingData: Ratings): Promise<Ratings> {
    try {
        const createdRating = await RatingsModel.create(ratingData);
        return createdRating;
    } catch (error) {
        console.error("Error creating rating:", error);
        throw new Error("Unable to create rating");
    }
}

async getRatingsByWorkerId (workerId: string) {
    try {
        const objectId = new mongoose.Types.ObjectId(workerId); 

        const ratings = await RatingsModel.find({ workerId: objectId }) 
            .populate({ path: "userId", select: "firstName lastName" }) 
            .lean();
        
        console.log(ratings);
        return ratings;
    } catch (error) {
        console.error("Error fetching ratings:", error);
        return [];
    }
}
}