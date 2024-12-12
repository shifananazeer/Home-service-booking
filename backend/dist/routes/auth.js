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
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
router.post("/login", [(0, express_validator_1.check)("email", "Email is Required").isEmail(),
    (0, express_validator_1.check)("password", "password with 6 or more character required").isLength({ min: 6 })
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ message: errors.array() });
    }
    else {
        const { email, password } = req.body;
        try {
            let user = yield user_1.default.findOne({ email });
            if (!user) {
                res.status(400).json({ message: "Invalid Credentials" });
            }
            else {
                const isMatch = yield bcrypt_1.default.compare(password, user.password);
                if (!isMatch) {
                    res.status(400).json({ message: "Invalid Credentials" });
                }
                else {
                    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
                    res.cookie("auth_token", token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        maxAge: 86400000,
                    });
                    res.status(200).json({ userId: user._id });
                }
            }
        }
        catch (error) {
            res.status(500).json({ message: "Something went wrong" });
        }
    }
}));
exports.default = router;
