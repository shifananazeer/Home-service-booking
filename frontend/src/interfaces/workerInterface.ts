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
    status: string;
    profilePic?:string;
    latitude?: number; // Add latitude
    longitude?: number; 

}


export interface WorkerProfileResponse {
    worker: WorkerProfileInterface; 
    address: Address; 
}