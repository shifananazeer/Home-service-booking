import { Address } from "./addressInterface";

export interface SignupWorker {
    name: string;      
    email: string;     
    phone: string;      
    skills: string[];  
    password: string;   
}

export interface WorkerProfileInterface {
    _id?:string;
    name:string;
    email:string;
    phone: string;
    skills:string[];
    expirience?: string ;
    hourlyRate?:number;
    status: string;
    profilePic?:string;
    latitude?: number; 
    longitude?: number; 
    averageRating:number;

}


export interface WorkerProfileResponse {
    worker: WorkerProfileInterface; 
    address: Address; 
}