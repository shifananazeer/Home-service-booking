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
}