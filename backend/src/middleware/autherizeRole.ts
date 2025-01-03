import { Request, Response, NextFunction } from 'express';
import { UserPayload } from './auth'; // Adjust the path accordingly

export const authorizeRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user as UserPayload;

        if (!user || !roles.includes(user.role)) {
         
            res.status(403).json({ error: 'Access denied: You do not have the required role' });
            return 
        }

        next();
    };
};
