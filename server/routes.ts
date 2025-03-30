import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { setupWebSockets } from "./socket";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API Routes
  // Skills routes
  app.get("/api/skills", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const skills = await storage.getSkillsByUser(userId);
    
    res.json(skills);
  });
  
  app.post("/api/skills", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const { name, isTeaching, proficiencyLevel, isVerified } = req.body;
    
    // Create skill
    const skill = await storage.createSkill({
      name,
      userId,
      isTeaching,
      proficiencyLevel: proficiencyLevel || "beginner",
      isVerified: isVerified || false
    });
    
    res.status(201).json(skill);
  });
  
  app.put("/api/skills/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const skillId = parseInt(req.params.id);
    
    const skill = await storage.getSkill(skillId);
    if (!skill) return res.status(404).send("Skill not found");
    if (skill.userId !== userId) return res.status(403).send("Forbidden");
    
    const updatedSkill = await storage.updateSkill(skillId, req.body);
    res.json(updatedSkill);
  });
  
  // User profile
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const user = await storage.getUser(userId);
    
    // Don't return password
    if (user) {
      const { password, ...userData } = user;
      res.json(userData);
    } else {
      res.status(404).send("User not found");
    }
  });
  
  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const { name, email, university, avatar } = req.body;
    
    const updatedUser = await storage.updateUser(userId, {
      name,
      email,
      university,
      avatar
    });
    
    if (updatedUser) {
      const { password, ...userData } = updatedUser;
      res.json(userData);
    } else {
      res.status(404).send("User not found");
    }
  });
  
  // Activity feed
  app.get("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const activities = await storage.getActivitiesByUser(userId);
    
    res.json(activities);
  });
  
  // Skill matching
  app.post("/api/skill-matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const { teachingSkillId, learningSkillId } = req.body;
    
    const matches = await storage.findSkillMatches(
      parseInt(teachingSkillId),
      parseInt(learningSkillId)
    );
    
    res.json(matches);
  });
  
  // Exchanges
  app.get("/api/exchanges", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const exchanges = await storage.getExchangesByUser(userId);
    
    // For each exchange, fetch the related skills
    const enrichedExchanges = await Promise.all(exchanges.map(async (exchange) => {
      const teacherSkill = await storage.getSkill(exchange.teacherSkillId);
      const studentSkill = await storage.getSkill(exchange.studentSkillId);
      
      let teacherUser, studentUser;
      if (exchange.teacherId === userId) {
        studentUser = await storage.getUser(exchange.studentId);
        teacherUser = req.user;
      } else {
        teacherUser = await storage.getUser(exchange.teacherId);
        studentUser = req.user;
      }
      
      // Remove passwords
      if (teacherUser) {
        const { password, ...teacherData } = teacherUser;
        teacherUser = teacherData;
      }
      
      if (studentUser) {
        const { password, ...studentData } = studentUser;
        studentUser = studentData;
      }
      
      return {
        ...exchange,
        teacherSkill,
        studentSkill,
        teacherUser,
        studentUser
      };
    }));
    
    res.json(enrichedExchanges);
  });
  
  app.post("/api/exchanges", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const { teacherId, studentId, teacherSkillId, studentSkillId } = req.body;
    
    // Validate that the current user is either the teacher or the student
    if (userId !== teacherId && userId !== studentId) {
      return res.status(403).send("Forbidden");
    }
    
    const exchange = await storage.createExchange({
      teacherId,
      studentId,
      teacherSkillId,
      studentSkillId,
      status: "pending"
    });
    
    // Create activity for exchange creation
    await storage.createActivity({
      userId,
      type: "exchange",
      description: "Created a new skill exchange request",
      pointsEarned: 0
    });
    
    res.status(201).json(exchange);
  });
  
  app.put("/api/exchanges/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const exchangeId = parseInt(req.params.id);
    
    const exchange = await storage.getExchange(exchangeId);
    if (!exchange) return res.status(404).send("Exchange not found");
    
    // Validate that the current user is involved in the exchange
    if (exchange.teacherId !== userId && exchange.studentId !== userId) {
      return res.status(403).send("Forbidden");
    }
    
    const updatedExchange = await storage.updateExchange(exchangeId, req.body);
    
    // If the exchange status changed to completed, award points
    if (req.body.status === "completed" && exchange.status !== "completed") {
      // Award points to both teacher and student
      await storage.createActivity({
        userId: exchange.teacherId,
        type: "exchange",
        description: "Completed a skill exchange as a teacher",
        pointsEarned: 100
      });
      
      await storage.createActivity({
        userId: exchange.studentId,
        type: "exchange",
        description: "Completed a skill exchange as a student",
        pointsEarned: 100
      });
    }
    
    res.json(updatedExchange);
  });
  
  // Sessions
  app.get("/api/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const exchanges = await storage.getExchangesByUser(userId);
    
    let sessions: any[] = [];
    for (const exchange of exchanges) {
      const exchangeSessions = await storage.getSessionsByExchange(exchange.id);
      
      // Enrich session data with exchange information
      const enrichedSessions = await Promise.all(exchangeSessions.map(async (session) => {
        const otherUserId = exchange.teacherId === userId ? exchange.studentId : exchange.teacherId;
        const otherUser = await storage.getUser(otherUserId);
        
        // Remove password
        let otherUserData;
        if (otherUser) {
          const { password, ...userData } = otherUser;
          otherUserData = userData;
        }
        
        return {
          ...session,
          exchange: {
            id: exchange.id,
            status: exchange.status
          },
          otherUser: otherUserData,
          isTeacher: exchange.teacherId === userId
        };
      }));
      
      sessions = [...sessions, ...enrichedSessions];
    }
    
    // Sort by scheduled time
    sessions.sort((a, b) => {
      if (!a.scheduledTime) return 1;
      if (!b.scheduledTime) return -1;
      return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
    });
    
    res.json(sessions);
  });
  
  app.post("/api/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const { exchangeId, scheduledTime, duration } = req.body;
    
    // Validate that the user is involved in the exchange
    const exchange = await storage.getExchange(exchangeId);
    if (!exchange) return res.status(404).send("Exchange not found");
    
    if (exchange.teacherId !== userId && exchange.studentId !== userId) {
      return res.status(403).send("Forbidden");
    }
    
    const session = await storage.createSession({
      exchangeId,
      scheduledTime,
      duration,
      status: "scheduled"
    });
    
    res.status(201).json(session);
  });
  
  app.put("/api/sessions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const sessionId = parseInt(req.params.id);
    
    const session = await storage.getSession(sessionId);
    if (!session) return res.status(404).send("Session not found");
    
    // Validate that the user is involved in the exchange
    const exchange = await storage.getExchange(session.exchangeId);
    if (!exchange) return res.status(404).send("Exchange not found");
    
    if (exchange.teacherId !== userId && exchange.studentId !== userId) {
      return res.status(403).send("Forbidden");
    }
    
    const updatedSession = await storage.updateSession(sessionId, req.body);
    
    // If session status changed to completed, update exchange sessions completed count
    if (req.body.status === "completed" && session.status !== "completed") {
      const currentCompleted = exchange.sessionsCompleted || 0;
      const sessionsCompleted = currentCompleted + 1;
      const updatedExchange = await storage.updateExchange(exchange.id, {
        sessionsCompleted
      });
      
      // If all sessions are completed, mark exchange as completed
      if (updatedExchange && updatedExchange.sessionsCompleted === updatedExchange.totalSessions) {
        await storage.updateExchange(exchange.id, { status: "completed" });
        
        // Award points to both participants
        await storage.createActivity({
          userId: exchange.teacherId,
          type: "exchange",
          description: "Completed all sessions in a skill exchange as a teacher",
          pointsEarned: 100
        });
        
        await storage.createActivity({
          userId: exchange.studentId,
          type: "exchange",
          description: "Completed all sessions in a skill exchange as a student",
          pointsEarned: 100
        });
      }
    }
    
    res.json(updatedSession);
  });
  
  // Badges
  app.get("/api/badges", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const badges = await storage.getAllBadges();
    res.json(badges);
  });
  
  app.get("/api/user-badges", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const userBadges = await storage.getUserBadges(userId);
    
    // Enrich with badge data
    const enrichedBadges = await Promise.all(userBadges.map(async (userBadge) => {
      const badge = await storage.getBadge(userBadge.badgeId);
      return {
        ...userBadge,
        badge
      };
    }));
    
    res.json(enrichedBadges);
  });
  
  // Challenges
  app.get("/api/challenges", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const challenges = await storage.getAllChallenges();
    const userChallenges = await storage.getUserChallenges(userId);
    
    // Map user challenges to challenges
    const enrichedChallenges = challenges.map(challenge => {
      const userChallenge = userChallenges.find(uc => uc.challengeId === challenge.id);
      
      return {
        ...challenge,
        userProgress: userChallenge ? {
          currentCount: userChallenge.currentCount,
          startedAt: userChallenge.startedAt,
          completedAt: userChallenge.completedAt
        } : null
      };
    });
    
    res.json(enrichedChallenges);
  });
  
  app.post("/api/user-challenges", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const { challengeId } = req.body;
    
    // Make sure the challenge exists
    const challenge = await storage.getChallenge(challengeId);
    if (!challenge) return res.status(404).send("Challenge not found");
    
    // Check if user already has this challenge
    const userChallenges = await storage.getUserChallenges(userId);
    const existingChallenge = userChallenges.find(uc => 
      uc.challengeId === challengeId && !uc.completedAt
    );
    
    if (existingChallenge) {
      return res.status(400).send("Challenge already in progress");
    }
    
    const userChallenge = await storage.createUserChallenge({
      userId,
      challengeId
    });
    
    res.status(201).json(userChallenge);
  });
  
  app.put("/api/user-challenges/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const userChallengeId = parseInt(req.params.id);
    
    // Get all user challenges and find the one we need
    const userChallenges = await storage.getUserChallenges(userId);
    const userChallenge = userChallenges.find(uc => uc.id === userChallengeId);
    if (!userChallenge) return res.status(404).send("User challenge not found");
    
    if (userChallenge.userId !== userId) {
      return res.status(403).send("Forbidden");
    }
    
    const updatedUserChallenge = await storage.updateUserChallenge(userChallengeId, req.body);
    res.json(updatedUserChallenge);
  });
  
  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });
  
  // Reviews
  app.get("/api/users/:userId/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = parseInt(req.params.userId);
    const reviews = await storage.getReviewsByUser(userId);
    res.json(reviews);
  });
  
  app.get("/api/users/:userId/rating", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = parseInt(req.params.userId);
    const rating = await storage.getUserRating(userId);
    res.json(rating);
  });
  
  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const reviewerId = req.user!.id;
    
    // Make sure the user can't review themselves
    if (reviewerId === req.body.reviewedUserId) {
      return res.status(400).send("You cannot review yourself");
    }
    
    // Create the review
    try {
      const review = await storage.createReview({
        ...req.body,
        reviewerId
      });
      
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // Skill Matches endpoint
  app.post("/api/skill-matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const { teachingSkillId, learningSkillId } = req.body;
    
    if (!teachingSkillId || !learningSkillId) {
      return res.status(400).send("Both teachingSkillId and learningSkillId are required");
    }
    
    try {
      const matches = await storage.findSkillMatches(teachingSkillId, learningSkillId);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // For development and testing only - a simplified endpoint to list all users
  // This would be removed in production
  app.get("/api/users-list", async (req, res) => {    
    // Get the first 20 registered users
    const validUsers = [];
    
    for (let i = 1; i <= 20; i++) {
      const user = await storage.getUser(i);
      if (user) {
        const { password, ...userData } = user;
        validUsers.push(userData);
      }
    }
    
    res.json(validUsers);
  });
  
  // Create the HTTP server
  const httpServer = createServer(app);
  
  // Set up websockets
  setupWebSockets(httpServer);

  return httpServer;
}
