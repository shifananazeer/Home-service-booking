import { Schema } from "mongoose";

export interface Notification {
    _id?:string;
    userId:  string ;
    userType: "user" | "worker";
    message:string;
    isRead?:boolean;
    timestamp?:Date;
}