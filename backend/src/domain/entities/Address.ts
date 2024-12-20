import mongoose from "mongoose";

 export interface Address {
    id?:string;
    userId: string;
    address: string;
    location?: {
        latitude?: number;
        longitude?: number;
    };
    area: string;
    __v?:number
 }