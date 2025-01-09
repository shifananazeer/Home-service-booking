// import { Request, Response, NextFunction } from 'express';

// export const authorize =
//     (...allowedRoles: string[]) =>
//     (req: Request, res: Response, next: NextFunction): void => {
//         const userRole = req.user?.role// Assuming `req.user` is set by `authenticateUser`.

//         if (!userRole) {
//             res.status(401).json({ message: 'Unauthorized: No role assigned' });
//             return; // Ensure no further processing happens
//         }

//         if (!allowedRoles.includes(userRole)) {
//             res.status(403).json({ message: 'Forbidden: Access is denied' });
//             return;
//         }


//         next(); // Proceed to the next middleware or route handler
//     };
