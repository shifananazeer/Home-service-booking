import { Types } from "mongoose";
import { Ratings } from "../entities/Rating";

  export interface RatingRepository {
    createRatings (ratingData:Ratings) : Promise<Ratings>;
    getRatingsByWorkerId(workerId: string | Types.ObjectId) :Promise<Ratings[]|[]>
  }