// Import required modules
import { Express, NextFunction, Request, Response } from "express";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { User as SelectUser } from "@shared/schema";
import { storage } from "./storage";

// Simple token storage for authentication
const userTokens = new Map<string, number>();

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return `${hash}:${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [storedHash, salt] = stored.split(":");
  
  const suppliedBuf = Buffer.from(
    createHash("sha256")
      .update(supplied + salt)
      .digest("hex")
  );
  
  const hashedBuf = Buffer.from(storedHash);
  
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Generate a random token
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// Authentication middleware
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const userId = userTokens.get(token);
  if (!userId) {
    console.log("Invalid token");
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  
  const user = await storage.getUser(userId);
  if (!user) {
    console.log("User not found");
    return res.status(401).json({ message: "User not found" });
  }
  
  // Add user to request
  (req as any).user = user;
  next();
};

export function setupAuth(app: Express) {
  console.log("Setting up token-based authentication");

  app.post("/api/register", async (req, res) => {
    const { username, password, name, email, university, avatar } = req.body;
    
    if (!username || !password || !name || !email) {
      return res.status(400).send("Missing required fields");
    }
    
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        message: "This username is already taken. Please choose a different username."
      });
    }

    try {
      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        name,
        email,
        university,
        avatar
      });

      // Create welcome activity
      await storage.createActivity({
        userId: user.id,
        type: "account",
        description: "Created account",
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

      // Generate a token for the new user
      const token = generateToken();
      userTokens.set(token, user.id);
      
      console.log("User registered successfully:", user.username);
      console.log("Token generated for new user");
      
      const { password: _, ...userData } = user;
      res.status(201).json({ user: userData, token });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt for:", username);
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        console.log("Authentication failed for:", username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Generate a token
      const token = generateToken();
      userTokens.set(token, user.id);
      
      console.log("User authenticated successfully:", user.username);
      console.log("Token generated:", token.substring(0, 10) + "...");
      
      const { password: _, ...userData } = user;
      return res.status(200).json({ user: userData, token });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Remove the token
      userTokens.delete(token);
      console.log("User logged out, token removed");
    }
    
    res.status(200).json({ message: "Logged out successfully" });
  });

  app.get("/api/user", isAuthenticated, (req, res) => {
    const user = (req as any).user;
    console.log("User data requested for:", user.username);
    
    const { password, ...userData } = user;
    console.log("Returning user data for:", userData.username);
    res.json(userData);
  });
  
  // Debug endpoint to check token data
  app.get("/api/debug/token", isAuthenticated, (req, res) => {
    const user = (req as any).user;
    
    if (user) {
      const { password, ...userData } = user;
      return res.json({
        authenticated: true,
        user: userData
      });
    } else {
      return res.json({
        authenticated: false,
        user: null
      });
    }
  });
}