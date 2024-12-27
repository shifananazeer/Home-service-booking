import mongoose, { Schema } from "mongoose";
import { Booking } from "../../../domain/entities/Booking";
import { UserDocument } from "./userModels";


export interface BookingDocument extends Booking{

}

const BookingSchema = new Schema<BookingDocument>({
  bookingId:{type:String, required:true},
  workerId:{type:mongoose.Schema.Types.ObjectId, ref:'Worker', required:true},
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User', required:true},
  date:{type:Date , required:true},
  slotId:{type:String , required:true},
  workDescription:{type:String , required:true},
  workLocation: {
    address: {type: String,required: true,},
    latitude: { type: Number,required: true},
     longitude: { type: Number, required: true},
},
workerName:{type:String} ,
serviceImage:{type:String},
serviceName:{type:String},
paymentStatus: {type: String,
    enum: ['Pending', 'Paid', 'Cancelled'], 
    required: true,
},

})

export const BookingModel = mongoose.model<BookingDocument>('Booking',BookingSchema);
export default BookingModel;