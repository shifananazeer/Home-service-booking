
import mongoose, { Schema, Document } from 'mongoose';

export interface Address extends Document {
    userId: mongoose.Types.ObjectId;
    address: string;
    location: {
        latitude: number;
        longitude: number;
    };
    area: string;
}

const addressSchema = new Schema<Address>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
    address: { type: String, required: true },
    location: {
        latitude: { type: Number },
        longitude: { type: Number},
    },
    area: { type: String, required: true },
});

const AddressModel = mongoose.model<Address>('Address', addressSchema);
export default AddressModel;
