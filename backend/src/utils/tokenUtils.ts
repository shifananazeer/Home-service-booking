import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

interface UserPayload {
    sub: string;
    email: string;
    role: string; 
}

export const verifyToken = (token: string): UserPayload => {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
    return decoded as UserPayload;
};
