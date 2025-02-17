import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserPayload {
    email: string;
    role: string; 
    _id: string; 
}


declare global {
    namespace Express {
        interface Request {
            user?: UserPayload; // Attach user property
        }
    }
}


export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); 

    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        console.error('No token provided'); 
        res.status(401).json({ error: 'Access token is required' });
        return; 
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err); 
            res.status(403).json({ error: 'Invalid or expired token' });
            return; 
        }

        const userPayload = decoded as UserPayload;

   
        if (userPayload.role !== 'admin') {
            console.error('Access denied: User is not an admin'); 
            res.status(403).json({ error: 'Access denied: Admins only' });
            return; 
        }

        req.user = userPayload; 
        console.log('Authenticated Admin:', req.user);
        next();
    });
};


