import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserPayload {
    email: string;
    role: string; // Role can be 'user', 'admin', etc.
    _id: string; 
}
const verifyToken = (token: string): UserPayload | null => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
        return decoded as UserPayload;
    } catch (err) {
        return null;
    }
};

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        res.status(401).json({ error: 'Access token is required' });
        return;
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'user') {
        res.status(403).json({ error: 'Unauthorized access for users' });
        return;
    }

    req.user = decoded;
    console.log("Authenticated User:", req.user);
    next();
};

// Middleware for authenticating workers
export const authenticateWorker = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        res.status(401).json({ error: 'Access token is required' });
        return;
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'worker') {
        res.status(403).json({ error: 'Unauthorized access for workers' });
        return;
    }

    req.user = decoded;
    console.log("Authenticated Worker:", req.user);
    next();
};


export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        res.status(401).json({ error: 'Access token is required' });
        return;
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
        res.status(403).json({ error: 'Unauthorized access for admins' });
        return;
    }

    req.user = decoded;
    console.log("Authenticated Admin:", req.user);
    next();
};