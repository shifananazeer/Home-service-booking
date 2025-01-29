import mongoose, { Schema } from "mongoose";
import { Transaction  , Wallet} from "../../../domain/entities/Wallet";

export interface WalletDocument extends Wallet, Document {}

// Transaction Schema
const TransactionSchema = new Schema<Transaction>({
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String },
    relatedBookingId: { type: String, required:true },
});

// Wallet Schema
const WalletSchema = new Schema<WalletDocument>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    balance: { type: Number, required: true, default: 0 },
    transactions: { type: [TransactionSchema], default: [] },
    isAdmin: { type: Boolean, required: true },
});

// Create the Wallet model
const WalletModel = mongoose.model<WalletDocument>('Wallet', WalletSchema);

export default WalletModel;