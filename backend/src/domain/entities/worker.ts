export interface Worker {
    name: string; 
    email: string; 
    phone: string; 
    skills: string[]; 
    password: string; 
    role: string; 
    isVerified?: boolean; 
    isBlocked?: boolean; 
    latitude?: number; 
    longitude?: number; 
    locationName?: string; 
}
