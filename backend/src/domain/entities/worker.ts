export interface Worker {
    _id:string;
    name: string; 
    email: string; 
    phone: string; 
    skills: [String],
    password: string; 
    role: string; 
    expirience?: number;
    profilePic?:string;
    status:string;
    isVerified?: boolean; 
    isBlocked?: boolean; 
    latitude?: number; 
    longitude?: number; 
    locationName?: string; 
}


export interface WorkerUpdates {
    name?: string;
    skills?: string[];
    experience?: string;
    status?: string;
    profilePic?: string;
}
