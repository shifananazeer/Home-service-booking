import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import { UserRepository } from "../../domain/repositories/userRepository";
import { User } from "../../domain/entities/User";
import { Worker } from '../../domain/entities/worker';
import jwt from 'jsonwebtoken';
import { sendResetEmail } from "../../infrastructure/services/passwordEmail";
import { verifyToken } from "../../utils/TokenGenerator";
import bcrypt from 'bcryptjs';
import { WorkerRepositoryImpl } from "../../infrastructure/database/repositories/WorkerRepositoryImpl";



interface TokenPayload {
    email: string;
    role: 'user' | 'worker'; // Adjust this based on your role definitions
    iat?: number; // Optional: Issued at timestamp
    exp?: number; // Optional: Expiration timestamp
}

export const sendResetLink = async (email: string, personType: number): Promise<void> => {
    let entity;

    if (personType === 1) { // User
        entity = await UserRepositoryImpl.findByEmail(email);
        if (!entity) {
            throw new Error('User not found');
        }
    } else if (personType === 0) { // Worker
        entity = await WorkerRepositoryImpl.findByEmail(email);
        if (!entity) {
            throw new Error('Worker not found');
        }
    } else {
        throw new Error('Invalid person type');
    }

    const resetToken = generateResetToken(entity);
    console.log("email", entity.email);
    console.log("resetToken", resetToken);
    await sendResetEmail(entity.email, resetToken ,personType);
};

type UserOrWorker = User | Worker;

export const generateResetToken = (entity: UserOrWorker): string => {
    const role = 'role' in entity ? entity.role : 'unknown'; // Default to 'unknown' if role is not found
    console.log("Generated Role:", role);
    const token = jwt.sign(
        {
            email: entity.email,
            role: role, // Include role in the token
        },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: "1d" }
    );

    return token;
};

export const validateToken = (token: string): TokenPayload | null => {
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as TokenPayload;
        return payload; // Return the payload if verification is successful
    } catch (error) {
        console.error('Token verification failed:', error);
        return null; // Return null if verification fails
    }
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    const payload = validateToken(token); // Ensure this retrieves the payload correctly
    console.log("Payload from token:", payload); 
    if (!payload) {
        throw new Error('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Determine the type of user (user or worker) and call the appropriate repository method
    if (payload.role === 'user') {
        await UserRepositoryImpl.updatePassword(payload.email, hashedPassword);
    } else if (payload.role === 'worker') {
        await WorkerRepositoryImpl.updatePassword(payload.email, hashedPassword);
    } else {
        throw new Error('Invalid role');
    }
};
