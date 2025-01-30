import { Ratings } from "../../domain/entities/Rating";
import { RatingRepository } from "../../domain/repositories/ratingRepository";
import { WorkerRepository } from "../../domain/repositories/workerRepository";
import { RatingRepositoryImpl } from "../../infrastructure/database/repositories/RatingRepositoryImpl";
import { WorkerRepositoryImpl } from "../../infrastructure/database/repositories/WorkerRepositoryImpl";



export class RatingService {
    private ratingRepository: RatingRepository;
    private workerRepository :WorkerRepository;
    
    constructor () {
        this.ratingRepository  = new RatingRepositoryImpl()
        this.workerRepository = new WorkerRepositoryImpl()
    }

    public async addRating(ratingData:Ratings) : Promise<Ratings>{
        const createdRating =  await this.ratingRepository.createRatings(ratingData);
        const allRatingsForWorker = await this.ratingRepository.getRatingsByWorkerId(ratingData.workerId);
        const totalRatings = allRatingsForWorker.length;
  const totalRatingValue = allRatingsForWorker.reduce((sum, r) => sum + r.rating, 0);
  const newAverageRating = totalRatings > 0 ? totalRatingValue / totalRatings : 0
  console.log("averageRatings" , newAverageRating)
  await this.workerRepository.updateWorkerAverageRating(ratingData.workerId, newAverageRating);
        return createdRating;
 }

 public   async getWorkerRatings(workerId: string) {
    const ratings = await this.ratingRepository.getRatingsByWorkerId(workerId);
    console.log('Fetched Ratings:', ratings); 

    const ratingValues = ratings.map((rating: { rating: any; }) => rating.rating);
    const reviews = ratings.map((rating: { userId: any; review: any; bookingId: any; }) => ({
        userId: rating.userId,
        review: rating.review,
        userName: `${rating.userId.firstName} ${rating.userId.lastName}`, 
        bookingId: rating.bookingId,
    }));

    return { ratings: ratingValues, reviews };
}
}