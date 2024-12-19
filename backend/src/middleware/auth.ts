import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface DecodedUser {
  email: string;
  role: string;
}

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const accessToken = req.cookies?.auth_token; // Use optional chaining for safety
  if (!accessToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as DecodedUser;

    req.user = decoded; // Attach decoded user to req
    next();
  } catch (error) {
    res.status(403).json({ message: "Access token is invalid or expired" });
  }
};
