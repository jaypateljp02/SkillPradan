import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if the user is an admin
 * Use this middleware after the isAuthenticated middleware
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // First make sure user is authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Check if user has admin privileges
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  
  // If admin, continue to the next middleware
  next();
};