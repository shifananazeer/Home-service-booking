import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../../infrastructure/database/models/userModels'; // Assuming User is your Mongoose model

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!, // Corrected to GOOGLE_CLIENT_ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: 'http://localhost:3000/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if the user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user); // User already exists
        }

        // Create a new user if not found
        user = new User({
            firstName: profile.name?.givenName || '', // Safely access givenName
            lastName: profile.name?.familyName || '', // Safely access familyName
            email: (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : '', // Get email
            googleId: profile.id,
        });

        // Save the new user
        await user.save();
        done(null, user);
    } catch (error) {
        done(error as Error);
    }
}));

export default passport;
