import { Types } from "mongoose";
export interface Ratings{
    id?:string;
   userId:Types.ObjectId;
   workerId:Types.ObjectId;
   bookingId:Types.ObjectId;
   review:string;
   rating:number;
   createdAt?: Date; 
}