import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { userId: number; role?: string };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      userId: number;
      role?: string;
    };
        req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
