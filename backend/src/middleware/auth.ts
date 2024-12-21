import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
interface UserPayload {
    email: string;
    role: string;
    _id: string; // Define the _id type to match what you include in the token
}

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); // Debugging line
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        console.error('No token provided'); // Debugging line
        res.status(401).json({ error: 'Access token is required' });
        return; // End the function here
    }

    // Verify the token using ACCESS_TOKEN_SECRET
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err); // Debugging line
            res.status(403).json({ error: 'Invalid or expired token' });
            return; // End the function here
        }
        const userPayload = user as UserPayload;
        // Attach the user to the request object
        req.user = user; // user contains the payload from the token
        console.log("requser",req.user)
        next(); // Proceed to the next middleware or route handler
    });
};

export default authenticateUser;




