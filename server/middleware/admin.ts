import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if the authenticated user is an admin.
 * This should be used after the isAuthenticated middleware.
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
}