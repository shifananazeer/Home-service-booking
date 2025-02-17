import { Types } from "mongoose";

// Transaction Interface
export interface Transaction {
    amount: number;
    type: 'credit' | 'debit'; 
    date: Date;
    description?: string;
    relatedBookingId: string; 
}

// Wallet Interface
export interface Wallet {
    userId: Types.ObjectId| null; 
    balance: number;
    transactions: Transaction[]; 
    isAdmin: boolean; 
}
