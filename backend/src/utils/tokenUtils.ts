import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

interface UserPayload {
    sub: string; // User ID
    email: string;
    role: string; // User role (e.g., 'admin', 'user')
}

export const verifyToken = (token: string): UserPayload => {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
    return decoded as UserPayload;
};
