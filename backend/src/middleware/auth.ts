import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
interface UserPayload {
    email: string;
    role: string;
    _id: string; 
}

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); 
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        console.error('No token provided'); 
        res.status(401).json({ error: 'Access token is required' });
        return; 
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err); 
            res.status(403).json({ error: 'Invalid or expired token' });
            return; 
        }
        const userPayload = user as UserPayload;
        req.user = user; 
        console.log("requser",req.user)
        next(); 
    });
};

export default authenticateUser;




