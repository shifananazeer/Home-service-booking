// src/middlewares/authenticateUser.ts

import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.auth_token;
  if (!accessToken) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(403).json({ message: "Access token is invalid or expired" });
  }
};
