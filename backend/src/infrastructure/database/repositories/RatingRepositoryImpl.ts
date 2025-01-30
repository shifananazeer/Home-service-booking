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
// async getRatingsByWorkerId (workerId: string | Types.ObjectId) :Promise<Ratings[]|[]> {
//     return await RatingsModel.find({ workerId });
// }
async getRatingsByWorkerId (workerId: string) {
    try {
        const objectId = new mongoose.Types.ObjectId(workerId); // Convert workerId to ObjectId

        const ratings = await RatingsModel.find({ workerId: objectId }) // Use ObjectId
            .populate({ path: "userId", select: "firstName lastName" }) // Populate user details
            .lean(); // Convert Mongoose docs to JSON
        
        console.log(ratings);
        return ratings;
    } catch (error) {
        console.error("Error fetching ratings:", error);
        return [];
    }
}
}