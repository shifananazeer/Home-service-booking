import mongoose, { Schema } from "mongoose";
import { Admin } from "../../../domain/entities/Admin";

export interface AdminDocument extends Admin {
    
}

const AdminSchema = new Schema<AdminDocument> ({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      name: {
        type: String,
        trim: true,
      },
      password: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        required: true,
        enum: ['admin', 'superadmin'], 
        default: 'admin',
      },
})

export const AdminModel = mongoose.model<AdminDocument>('Admin',AdminSchema);
export default AdminModel;