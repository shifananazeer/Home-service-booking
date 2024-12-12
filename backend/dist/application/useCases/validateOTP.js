"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOtp = void 0;
const OTPModel_1 = require("../../infrastructure/database/models/OTPModel");
const validateOtp = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otpEntry = yield OTPModel_1.OTPModel.findOne({ email, otp });
        if (!otpEntry) {
            throw new Error('Invalid OTP');
        }
        if (otpEntry.expiresAt < new Date()) {
            throw new Error('OTP has expired');
        }
        // If OTP is valid and not expired, you may want to delete it
        yield OTPModel_1.OTPModel.deleteOne({ _id: otpEntry._id });
        return true;
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.validateOtp = validateOtp;
