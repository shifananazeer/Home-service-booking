export interface Worker {
    toObject(): Worker | PromiseLike<Worker | null> | null;
    _id:string;
    name: string; 
    email: string; 
    phone: string; 
    skills: string[],
    password: string; 
    role: string; 
    expirience?: number;
    hourlyRate?:number;
    profilePic?:string;
    status:string;
    isVerified?: boolean; 
    isBlocked?: boolean; 
    latitude?: number; 
    longitude?: number; 
    locationName?: string; 
    isOnline:boolean;
    averageRating?: number;
}


export interface WorkerUpdates {
    name?: string;
    skills?: string[];
    experience?: string;
    status?: string;
    profilePic?: string;
    hourlyRate?:number;
}
