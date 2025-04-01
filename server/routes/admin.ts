import { Router } from "express";
import { isAuthenticated } from "../token-auth";
import { isAdmin } from "../middleware/admin";
import { storage } from "../storage";

// Create a router for admin routes
const adminRouter = Router();

// Require authentication and admin privileges for all routes
adminRouter.use(isAuthenticated, isAdmin);

// Get all users (for admin dashboard)
adminRouter.get("/users", async (req, res) => {
  try {
    // In a real application with a proper database, we'd use pagination here
    // For now, get a limited number of users for display
    const users = [];
    
    // Get the first 100 registered users (or as many as exist)
    for (let i = 1; i <= 100; i++) {
      const user = await storage.getUser(i);
      if (user) {
        // Don't return password
        const { password, ...userData } = user;
        users.push(userData);
      }
    }
    
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Error retrieving users" });
  }
});

// Get all skills (for admin dashboard)
adminRouter.get("/skills", async (req, res) => {
  try {
    // In a real application, this would be a database query
    // For now, collect all skills from all users
    const skills = [];
    
    // Get the first 100 skills (or as many as exist)
    for (let i = 1; i <= 100; i++) {
      const skill = await storage.getSkill(i);
      if (skill) {
        skills.push(skill);
      }
    }
    
    res.json(skills);
  } catch (error) {
    console.error("Error getting skills:", error);
    res.status(500).json({ message: "Error retrieving skills" });
  }
});

// Get all exchanges (for admin dashboard)
adminRouter.get("/exchanges", async (req, res) => {
  try {
    // In a real application, this would be a database query
    // For now, collect all exchanges
    const exchanges = [];
    
    // Get the first 100 exchanges (or as many as exist)
    for (let i = 1; i <= 100; i++) {
      const exchange = await storage.getExchange(i);
      if (exchange) {
        exchanges.push(exchange);
      }
    }
    
    res.json(exchanges);
  } catch (error) {
    console.error("Error getting exchanges:", error);
    res.status(500).json({ message: "Error retrieving exchanges" });
  }
});

// Make a user an admin
adminRouter.post("/users/:id/make-admin", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update user to make them an admin
    const updatedUser = await storage.updateUser(userId, {
      isAdmin: true
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: "Failed to update user" });
    }
    
    // Don't return password
    const { password, ...userData } = updatedUser;
    
    res.json({
      message: "User has been granted admin privileges",
      user: userData
    });
  } catch (error) {
    console.error("Error updating user admin status:", error);
    res.status(500).json({ message: "Error updating user admin status" });
  }
});

// Remove admin status from a user
adminRouter.post("/users/:id/remove-admin", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent removing admin status from self
    if (userId === req.user!.id) {
      return res.status(400).json({ 
        message: "Cannot remove your own admin privileges" 
      });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update user to remove admin privileges
    const updatedUser = await storage.updateUser(userId, {
      isAdmin: false
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: "Failed to update user" });
    }
    
    // Don't return password
    const { password, ...userData } = updatedUser;
    
    res.json({
      message: "Admin privileges have been removed",
      user: userData
    });
  } catch (error) {
    console.error("Error updating user admin status:", error);
    res.status(500).json({ message: "Error updating user admin status" });
  }
});

// Get system stats (for admin dashboard)
adminRouter.get("/stats", async (req, res) => {
  try {
    // Count users, skills, exchanges, sessions, groups
    let userCount = 0;
    let skillCount = 0;
    let exchangeCount = 0;
    let sessionCount = 0;
    let groupCount = 0;
    
    // Count users
    for (let i = 1; i <= 1000; i++) {
      const user = await storage.getUser(i);
      if (user) userCount++;
      else break; // Stop when we hit the first missing ID
    }
    
    // Count skills
    for (let i = 1; i <= 1000; i++) {
      const skill = await storage.getSkill(i);
      if (skill) skillCount++;
      else break;
    }
    
    // Count exchanges
    for (let i = 1; i <= 1000; i++) {
      const exchange = await storage.getExchange(i);
      if (exchange) exchangeCount++;
      else break;
    }
    
    // Count sessions
    for (let i = 1; i <= 1000; i++) {
      const session = await storage.getSession(i);
      if (session) sessionCount++;
      else break;
    }
    
    // Count groups
    for (let i = 1; i <= 1000; i++) {
      const group = await storage.getGroup(i);
      if (group) groupCount++;
      else break;
    }
    
    res.json({
      stats: {
        users: userCount,
        skills: skillCount,
        exchanges: exchangeCount,
        sessions: sessionCount,
        groups: groupCount
      }
    });
  } catch (error) {
    console.error("Error getting system stats:", error);
    res.status(500).json({ message: "Error retrieving system stats" });
  }
});

export default adminRouter;