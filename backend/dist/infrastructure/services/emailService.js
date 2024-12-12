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
exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for 465, false for other ports
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your App Password
    },
    tls: {
        rejectUnauthorized: false, // Accept self-signed certificates (if necessary)
    },
    debug: true, // Enable debug output
});
// Function to send OTP email
const sendOtpEmail = (to, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Sending OTP...");
        const mailOptions = {
            from: process.env.EMAIL_USER, // Your Gmail address
            to,
            subject: "OTP Verification from ServiceHub",
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2>OTP Verification</h2>
                <p>Hi,</p>
                <p>Your OTP for verification is: <strong>${otp}</strong></p>
                <p>This OTP is valid only for 5 minutes. Please do not share it with anyone.</p>
                <p>Thank you,<br>The ServiceHub Team</p>
            </div>
            `
        };
        yield transporter.sendMail(mailOptions);
        console.log('OTP sent successfully');
    }
    catch (error) {
        console.error("Error sending OTP:", error.message); // Log the error message
        throw new Error("Failed to send OTP");
    }
});
exports.sendOtpEmail = sendOtpEmail;
