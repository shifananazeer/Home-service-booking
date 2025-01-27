import { Ratings } from "../entities/Rating";

  export interface RatingRepository {
    createRatings (ratingData:Ratings) : Promise<Ratings>;
  }