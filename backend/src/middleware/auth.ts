import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserPayload {
    email: string;
    role: string; 
    _id: string; 
}

const verifyToken = (token: string): UserPayload | null => {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as UserPayload;
    } catch (err:any) {
        console.error("JWT Verification Error:", err.message); // Log for debugging
        return null;
    }
};

// Generalized Authentication Middleware
const authenticateRole = (requiredRole: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if (!token) {
            res.status(401).json({ error: 'Access token is required' });
            return;
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            res.status(403).json({ error: 'Invalid or expired access token' });
            return;
        }

        if (decoded.role !== requiredRole) {
            res.status(403).json({ error: `Access denied: ${requiredRole} role required` });
            return;
        }

        req.user = decoded;
        console.log(`Authenticated ${requiredRole}:`, req.user);
        next();
    };
};

// Export Role-Based Authentication Middlewares
export const authenticateUser = authenticateRole('user');
export const authenticateWorker = authenticateRole('worker');
export const authenticateAdmin = authenticateRole('admin');
