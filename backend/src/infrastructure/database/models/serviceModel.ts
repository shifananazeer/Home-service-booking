import mongoose, { Schema } from "mongoose";
import { Service } from "../../../domain/entities/Service";

export interface ServiceDocument extends Service{}

const  ServiceSchema = new Schema<ServiceDocument>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
})


export const ServiceModel = mongoose.model<ServiceDocument>('Service',ServiceSchema);
export default ServiceModel