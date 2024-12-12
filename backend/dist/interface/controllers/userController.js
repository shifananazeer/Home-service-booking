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
exports.userController = void 0;
const registerUser_1 = require("../../application/useCases/registerUser");
const UserRepositoryImpl_1 = require("../../infrastructure/database/repositories/UserRepositoryImpl");
const loginUser_1 = require("../../application/useCases/loginUser");
const validateOTP_1 = require("../../application/useCases/validateOTP");
const generateOtp_1 = require("../../application/useCases/generateOtp");
const passportConfig_1 = __importDefault(require("../../interface/middleware/passportConfig"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.userController = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield (0, registerUser_1.registerUser)(UserRepositoryImpl_1.UserRepositoryImpl, req.body);
            yield (0, generateOtp_1.generateOtp)(user.email);
            res
                .status(200)
                .json({ message: "User registered. OTP sent to your email." });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = yield (0, loginUser_1.loginUser)(UserRepositoryImpl_1.UserRepositoryImpl, req.body.email, req.body.password);
            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 86400000
            });
            res.status(200).json({ message: "You can now log in.", token });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    validateOtp: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const isValid = yield (0, validateOTP_1.validateOtp)(req.body.email, req.body.otp);
            if (isValid) {
                res.status(200).json({ message: 'OTP is valid.' });
            }
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    resendOtp: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, generateOtp_1.generateOtp)(req.body.email);
            res.status(200).json({ message: 'OTP resend to Your Email' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }),
    googleAuth: (req, res, next) => {
        passportConfig_1.default.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    },
    googleAuthCallback: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        passportConfig_1.default.authenticate('google', { failureRedirect: '/login' }, (err, user, info) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({ message: 'Authentication failed' });
            }
            try {
                // Generate JWT tokens
                const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });
                const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '48h' });
                // Set cookies for access and refresh tokens
                res.cookie('access_token', accessToken, {
                    maxAge: 5 * 60 * 1000, // 5 minutes
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // Use secure in production
                    sameSite: 'none',
                });
                res.cookie('refresh_token', refreshToken, {
                    maxAge: 48 * 60 * 60 * 1000, // 48 hours
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'none',
                });
                // Redirect or send a success response
                res.status(200).json({ message: 'Authentication successful', user });
            }
            catch (error) {
                next(error); // Pass any errors to the error handler
            }
        }))(req, res, next);
    })
};
