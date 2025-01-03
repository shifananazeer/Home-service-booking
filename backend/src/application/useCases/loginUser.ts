import { UserRepository } from "../../domain/repositories/userRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser = async (
    userRepository: UserRepository,
    email: string,
    password: string
): Promise<{ accessToken: string; refreshToken: string; userId: string }> => {
    // Check if the user exists
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Check if the user is blocked
    if (user.isBlocked) {
        throw new Error("You are blocked by the admin. Please contact support.");
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // Generate Access Token
    const accessToken = jwt.sign(
        { sub: user._id, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" } // Adjust expiration time as needed
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
        { sub: user._id, email: user.email, role: user.role },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "7d" } // Adjust expiration time as needed
    );

    // Log user ID for debugging
    console.log("User ID:", user._id);

    return {
        accessToken,
        refreshToken,
        userId: user._id.toString(), // Ensure ID is returned as a string
    };
};
