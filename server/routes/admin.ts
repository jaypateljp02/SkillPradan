import { Router } from "express";
import { isAuthenticated } from "../token-auth";
import { isAdmin } from "../middleware/admin";
import { storage } from "../storage";

// Create a router for admin routes
const adminRouter = Router();

// Require token-based authentication and admin privileges for all routes
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
    // Use Supabase count queries for efficient counting
    const { supabase } = await import("../supabase.config");

    // Count users
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Count skills
    const { count: skillCount, error: skillError } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true });

    // Count exchanges
    const { count: exchangeCount, error: exchangeError } = await supabase
      .from('exchanges')
      .select('*', { count: 'exact', head: true });

    // Count sessions
    const { count: sessionCount, error: sessionError } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    // Count groups
    const { count: groupCount, error: groupError } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true });

    // Check for errors
    if (userError || skillError || exchangeError || sessionError || groupError) {
      console.error("Error counting stats:", { userError, skillError, exchangeError, sessionError, groupError });
      return res.status(500).json({ message: "Error retrieving system stats" });
    }

    res.json({
      stats: {
        users: userCount || 0,
        skills: skillCount || 0,
        exchanges: exchangeCount || 0,
        sessions: sessionCount || 0,
        groups: groupCount || 0
      }
    });
  } catch (error) {
    console.error("Error getting system stats:", error);
    res.status(500).json({ message: "Error retrieving system stats" });
  }
});

export default adminRouter;