import { Types } from 'mongoose';

export interface Worker {
    _id?: Types.ObjectId; 
    id?: string;
    name: string;
    email: string;
    phone: string;
    skills: string;
    password: string;
    isVerified?: boolean;
}
