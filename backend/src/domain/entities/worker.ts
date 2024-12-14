import { Types } from 'mongoose';

export interface Worker {
    _id?: Types.ObjectId; // Optional ObjectId for MongoDB
    id?: string; // Optional string for ID (e.g., for external references)
    name: string; // Worker's name
    email: string; // Worker's email
    phone: string; // Worker's phone number
    skills: string[]; // Array of skills (using `string[]` is preferred over `[String]` for type safety in TypeScript)
    password: string; // Hashed password
    isVerified?: boolean; // Optional verification flag (default is `false`)
    role:string;
    isBlocked?:Boolean,
    latitude?: number;
    longitude?: number;
    locationName?:string;
}
