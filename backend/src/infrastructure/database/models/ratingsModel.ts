
import mongoose, { model, Schema } from "mongoose";
import { Ratings } from "../../../domain/entities/Rating";


export interface RatingsDocument extends Ratings , Document {}

const ratingsSchema = new Schema<RatingsDocument> ({
    userId: {
        type:Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    workerId: {
        type:Schema.Types.ObjectId,
        ref: 'Worker', // Reference to the Worker model (if applicable)
        required: true,
    },
    bookingId: {
        type:Schema.Types.ObjectId,
        ref: 'Booking', // Reference to the Booking model
        required: true,
    },
    review: {
        type: String,
        trim: true,
        maxlength: 500, // Optional: limit review length
    },
    rating: {
        type: Number,
        required: true,
        min: 1, // Minimum rating score
        max: 5, // Maximum rating score
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export const RatingsModel = model<RatingsDocument>('Ratings', ratingsSchema);
export default RatingsModel;