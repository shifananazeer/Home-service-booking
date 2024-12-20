import { Address } from "./addressInterface";

export interface SignupWorker {
    name: string;      
    email: string;     
    phone: string;      
    skills: string[];  
    password: string;   
}

export interface WorkerProfileInterface {
    name:string;
    email:string;
    phone: string;
    skills:string[];
    expirience?: string ;
    status: string;
    profilePic?:string;

}


export interface WorkerProfileResponse {
    worker: WorkerProfileInterface; 
    address: Address; 
}