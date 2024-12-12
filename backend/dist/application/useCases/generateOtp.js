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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = void 0;
const crypto_1 = __importDefault(require("crypto"));
const OTPModel_1 = require("../../infrastructure/database/models/OTPModel");
const emailService_1 = require("../../infrastructure/services/emailService");
const generateOtp = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Generate a random 6-digit OTP
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        // Set OTP expiration time (e.g., 10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        // Save the OTP in the OTP collection
        const otpEntry = new OTPModel_1.OTPModel({ email, otp, expiresAt });
        yield otpEntry.save();
        // Send OTP to user's email
        yield (0, emailService_1.sendOtpEmail)(email, otp);
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.generateOtp = generateOtp;
