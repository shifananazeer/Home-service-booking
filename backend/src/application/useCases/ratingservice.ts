import { Ratings } from "../../domain/entities/Rating";
import { RatingRepository } from "../../domain/repositories/ratingRepository";
import { RatingRepositoryImpl } from "../../infrastructure/database/repositories/RatingRepositoryImpl";



export class RatingService {
    private ratingRepository: RatingRepository;
    
    constructor () {
        this.ratingRepository  = new RatingRepositoryImpl()
    }

    public async addRating(ratingData:Ratings) : Promise<Ratings>{
        return await this.ratingRepository.createRatings(ratingData);
 }}