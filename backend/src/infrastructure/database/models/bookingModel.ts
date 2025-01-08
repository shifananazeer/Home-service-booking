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
// paymentStatus: {type: String,
//     enum: ['Pending', 'Completed','Confirmed', 'Cancelled'], 
//     required: true,
// },

paymentStatus: {
  type: String,
  enum: ['pending', 'advance_paid', 'balance_due', 'paid'],
  default: 'pending',
},
workStatus: {
  type: String,
  enum: ['not_started', 'in_progress', 'completed', 'canceled'],
  default: 'not_started',
},
advancePayment: { type: Number, required: true },
totalPayment: { type: Number, required: true },
balancePayment: { type: Number, default: 0 },
createdAt: { type: Date, default: Date.now },

})

export const BookingModel = mongoose.model<BookingDocument>('Booking',BookingSchema);
export default BookingModel;