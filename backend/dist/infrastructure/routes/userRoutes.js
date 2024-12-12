"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../../interface/controllers/userController");
const router = express_1.default.Router();
router.post("/register", userController_1.userController.register);
router.post("/login", userController_1.userController.login);
router.post("/verify-otp", userController_1.userController.validateOtp);
router.post("/resend-otp", userController_1.userController.resendOtp);
router.get('/google', userController_1.userController.googleAuth);
router.get('/google/callback', userController_1.userController.googleAuthCallback);
exports.default = router;
