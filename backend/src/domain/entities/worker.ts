export interface Worker {
    name: string; // Worker's name
    email: string; // Worker's email
    phone: string; // Worker's phone number
    skills: string[]; // Array of skills
    password: string; // Hashed password
    role: string; // Role of the worker
    isVerified?: boolean; // Optional verification flag (default is false)
    isBlocked?: boolean; // Optional block status
    latitude?: number; // Optional latitude
    longitude?: number; // Optional longitude
    locationName?: string; // Optional location name
}
