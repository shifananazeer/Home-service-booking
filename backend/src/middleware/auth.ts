import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserPayload {
    email: string;
    role: string; // Role can be 'user', 'admin', etc.
    _id: string; 
}

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  console.log("token", token)
    if (!token) {
      
        res.status(401).json({ error: 'Access token is required' });
        return 
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decodedToken) => {
        if (err) {
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }
        const decoded = decodedToken as UserPayload;
        req.user = decoded;
        console.log("Authenticated User:", req.user);

        next();
    });
};
