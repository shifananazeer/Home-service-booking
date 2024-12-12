"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Create the OTP schema
// const otpSchema: Schema = new Schema({
//     email: { type: String, required: true },
//     otp: { type: String, required: true },
//     expiresAt: { type: Date, required: true }
// });
const otpSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: '5m' } }, // TTL Index
});
// Create the OTP model
exports.OTPModel = mongoose_1.default.model('OTP', otpSchema);
