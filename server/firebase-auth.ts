// Import required modules
import { Express, NextFunction, Request, Response } from "express";
import { User as SelectUser } from "@shared/schema";
import { storage } from "./storage";

// Store Firebase UIDs to user IDs mapping
export const firebaseUsers = new Map<string, number>();

// Add interfaces for authenticated Request
declare global {
  namespace Express {
    interface User extends SelectUser {} 
    
    interface Request {
      user?: User; 
      isAuthenticated(): boolean;
    }
  }
}

// Create a custom interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user: SelectUser;
}

// Firebase authentication middleware
export const isFirebaseAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  // The Firebase UID should be sent in a custom header
  const firebaseUid = req.headers['x-firebase-uid'] as string;
  
  if (!firebaseUid) {
    console.log("No Firebase UID provided");
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const userId = firebaseUsers.get(firebaseUid);
  if (!userId) {
    console.log("Invalid Firebase UID or user not found");
    return res.status(401).json({ message: "Invalid authentication or user not found" });
  }
  
  const user = await storage.getUser(userId);
  if (!user) {
    console.log("User not found for Firebase UID");
    return res.status(401).json({ message: "User not found" });
  }
  
  // Add user to request
  (req as AuthenticatedRequest).user = user;
  
  // Add isAuthenticated method to maintain compatibility
  req.isAuthenticated = function(this: AuthenticatedRequest): this is AuthenticatedRequest {
    return true;
  };
  
  next();
};

export function setupFirebaseAuth(app: Express) {
  console.log("Setting up Firebase authentication");

  // Register with Firebase UID
  app.post("/api/firebase-register", async (req, res) => {
    const { firebaseUid, email, username, name, university, avatar } = req.body;
    
    if (!firebaseUid || !email || !username || !name) {
      return res.status(400).send("Missing required fields");
    }
    
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        message: "This username is already taken. Please choose a different username."
      });
    }

    try {
      // Create a temporary placeholder password since our schema requires it
      // This won't be used for authentication as we'll use Firebase instead
      const tempPassword = Math.random().toString(36).substring(2);
      
      const user = await storage.createUser({
        username,
        password: tempPassword, // We won't use this for auth
        name,
        email,
        university,
        avatar
      });

      // Store the mapping between Firebase UID and our user ID
      firebaseUsers.set(firebaseUid, user.id);

      // Create welcome activity
      await storage.createActivity({
        userId: user.id,
        type: "account",
        description: "Created account with Firebase",
        pointsEarned: 50
      });

      // Add a sample challenge for new users
      const challenges = await storage.getAllChallenges();
      if (challenges.length > 0) {
        await storage.createUserChallenge({
          userId: user.id,
          challengeId: challenges[0].id
        });
      }
      
      console.log("User registered with Firebase successfully:", user.username);
      
      const { password: _, ...userData } = user;
      res.status(201).json({ user: userData });
    } catch (error) {
      console.error("Firebase registration error:", error);
      res.status(500).json({ message: "Failed to register user with Firebase" });
    }
  });

  // Login with Firebase
  app.post("/api/firebase-login", async (req, res) => {
    const { firebaseUid } = req.body;
    
    if (!firebaseUid) {
      return res.status(400).json({ message: "Firebase UID is required" });
    }
    
    const userId = firebaseUsers.get(firebaseUid);
    
    if (!userId) {
      return res.status(404).json({ 
        message: "User not found. This Firebase account may not be registered with our system yet."
      });
    }
    
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("User authenticated with Firebase successfully:", user.username);
      
      const { password: _, ...userData } = user;
      return res.status(200).json({ user: userData });
    } catch (error) {
      console.error("Firebase login error:", error);
      return res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Logout from Firebase
  app.post("/api/firebase-logout", (req, res) => {
    // We'll keep the Firebase UID mapping for now
    // The client will handle signing out from Firebase
    res.status(200).json({ message: "Logged out successfully" });
  });

  // Get user data
  app.get("/api/firebase-user", isFirebaseAuthenticated, (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    console.log("User data requested for Firebase user:", user.username);
    
    const { password, ...userData } = user;
    res.json(userData);
  });
}