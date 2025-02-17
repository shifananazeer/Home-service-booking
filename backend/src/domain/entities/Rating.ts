import { Types } from "mongoose";
export interface Ratings{
    id?:string;
    userId: Types.ObjectId | string;
    workerId: Types.ObjectId | string;
    bookingId: Types.ObjectId | string;
   review:string;
   rating:number;
   createdAt?: Date; 
}