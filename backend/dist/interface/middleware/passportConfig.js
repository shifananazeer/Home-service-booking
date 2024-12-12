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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const user_1 = __importDefault(require("../../models/user")); // Assuming User is your Mongoose model
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Corrected to GOOGLE_CLIENT_ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/google/callback',
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Check if the user already exists
        let user = yield user_1.default.findOne({ googleId: profile.id });
        if (user) {
            return done(null, user); // User already exists
        }
        // Create a new user if not found
        user = new user_1.default({
            firstName: ((_a = profile.name) === null || _a === void 0 ? void 0 : _a.givenName) || '', // Safely access givenName
            lastName: ((_b = profile.name) === null || _b === void 0 ? void 0 : _b.familyName) || '', // Safely access familyName
            email: (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : '', // Get email
            googleId: profile.id,
        });
        // Save the new user
        yield user.save();
        done(null, user);
    }
    catch (error) {
        done(error);
    }
})));
exports.default = passport_1.default;
