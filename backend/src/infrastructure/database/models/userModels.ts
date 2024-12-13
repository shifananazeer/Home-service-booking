// src/models/userModel.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../../../domain/entities/User'; // Adjust the import path as necessary

// Extend Document with User interface
export interface UserType extends Document, User {}

// Create User Schema
const userSchema = new Schema<UserType>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, default: null },
    password: { type: String},
    isBlocked:{type: Boolean , default:false},
    isVerified:{ type: Boolean , default : false},
    locationName: { type: String, required: false },
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
});

userSchema.index({ mobileNumber: 1 }, { unique: true, partialFilterExpression: { mobileNumber: { $ne: null } } });

// Password Hashing Middleware
userSchema.pre<UserType>('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// Clear the model if it exists to prevent OverwriteModelError
if (mongoose.models.User) {
    delete mongoose.models.User;
}

// Create and export the User model
const UserModel = mongoose.model<UserType>('User', userSchema);
export default UserModel;
