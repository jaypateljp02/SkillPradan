import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { setupAuth, isAuthenticated, userTokens } from "./token-auth";
import { setupFirebaseAuth, isFirebaseAuthenticated, firebaseUsers } from "./firebase-auth";
import { setupWebSockets } from "./socket";
import { 
  insertGroupSchema, 
  insertGroupMemberSchema, 
  insertGroupEventSchema, 
  insertGroupFileSchema, 
  insertGroupMessageSchema 
} from "@shared/schema";
import adminRouter from "./routes/admin";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add a debug route to check server status
  app.get('/api/debug/status', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });
  
  // Add a debug route to check token
  app.get('/api/debug/token', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    res.json({
      authenticated: !!req.user,
      token: token ? `${token.substring(0, 5)}...` : null,
      user: req.user ? {
        id: req.user.id,
        username: req.user.username,
        name: req.user.name
      } : null
    });
  });
  // Set up authentication routes
  setupAuth(app);
  setupFirebaseAuth(app);
  
  // Create a combined authentication middleware that accepts either token or Firebase auth
  const isAuthenticatedEither = async (req: Request, res: Response, next: NextFunction) => {
    // Check for token-based auth first
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      // Continue with token auth
      return isAuthenticated(req, res, next);
    }
    
    // Then check for Firebase auth
    const firebaseUid = req.headers['x-firebase-uid'] as string;
    if (firebaseUid) {
      // Continue with Firebase auth
      return isFirebaseAuthenticated(req, res, next);
    }
    
    // No auth provided
    return res.status(401).json({ message: "Authentication required" });
  };

  // API Routes
  // Skills routes
  app.get("/api/skills", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const skills = await storage.getSkillsByUser(userId);
    
    res.json(skills);
  });
  
  app.post("/api/skills", isAuthenticated, async (req, res) => {
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
  
  app.put("/api/skills/:id", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const skillId = parseInt(req.params.id);
    
    const skill = await storage.getSkill(skillId);
    if (!skill) return res.status(404).send("Skill not found");
    if (skill.userId !== userId) return res.status(403).send("Forbidden");
    
    const updatedSkill = await storage.updateSkill(skillId, req.body);
    res.json(updatedSkill);
  });
  
  // User profile
  app.get("/api/profile", isAuthenticated, async (req, res) => {
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
  
  app.put("/api/profile", isAuthenticated, async (req, res) => {
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
  app.get("/api/activities", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const activities = await storage.getActivitiesByUser(userId);
      
      res.json(activities || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Error fetching activities" });
    }
  });
  
  // Skill matching
  app.post("/api/skill-matches", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { teachingSkillId, learningSkillId } = req.body;
      
      // Validate input
      if (!teachingSkillId || !learningSkillId) {
        return res.status(400).json({ message: "Both teaching and learning skill IDs are required" });
      }
      
      // Convert to numbers and validate
      const teachingId = Number(teachingSkillId);
      const learningId = Number(learningSkillId);
      
      if (isNaN(teachingId) || isNaN(learningId)) {
        return res.status(400).json({ message: "Skill IDs must be valid numbers" });
      }
      
      // Verify the skills exist and belong to this user
      const teachingSkill = await storage.getSkill(teachingId);
      const learningSkill = await storage.getSkill(learningId);
      
      if (!teachingSkill || !learningSkill) {
        return res.status(404).json({ message: "One or both skills not found" });
      }
      
      if (teachingSkill.userId !== userId || learningSkill.userId !== userId) {
        return res.status(403).json({ message: "You can only match with your own skills" });
      }
      
      // Find matches
      const matches = await storage.findSkillMatches(teachingId, learningId);
      
      res.json(matches);
    } catch (error) {
      console.error("Error finding skill matches:", error);
      res.status(500).json({ message: "Failed to find skill matches" });
    }
  });
  
  // Exchanges
  app.get("/api/exchanges", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const exchanges = await storage.getExchangesByUser(userId);
      
      // For each exchange, fetch the related skills
    const enrichedExchanges = await Promise.all(exchanges.map(async (exchange) => {
      const teacherSkill = await storage.getSkill(exchange.teacherSkillId);
      const studentSkill = await storage.getSkill(exchange.studentSkillId);
      
      let teacherUser, studentUser;
      if (exchange.teacherId === userId) {
        studentUser = await storage.getUser(exchange.studentId);
        teacherUser = req.user!;
      } else {
        teacherUser = await storage.getUser(exchange.teacherId);
        studentUser = req.user!;
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
  } catch (error) {
    console.error("Error fetching exchanges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
  });
  
  app.post("/api/exchanges", isAuthenticated, async (req, res) => {
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
  
  app.put("/api/exchanges/:id", isAuthenticated, async (req, res) => {
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
  app.get("/api/sessions", isAuthenticated, async (req, res) => {
    try {
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
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/sessions", isAuthenticated, async (req, res) => {
    
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
  
  app.put("/api/sessions/:id", isAuthenticated, async (req, res) => {
    
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
  app.get("/api/badges", isAuthenticated, async (req, res) => {
    
    const badges = await storage.getAllBadges();
    res.json(badges);
  });
  
  app.get("/api/user-badges", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userBadges = await storage.getUserBadges(userId);
      
      // Enrich with badge data
      const enrichedBadges = await Promise.all(userBadges.map(async (userBadge) => {
        try {
          const badge = await storage.getBadge(userBadge.badgeId);
          return {
            ...userBadge,
            badge
          };
        } catch (error) {
          console.error(`Error fetching badge ${userBadge.badgeId}:`, error);
          return userBadge; // Return at least the user badge data
        }
      }));
      
      res.json(enrichedBadges || []);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Error fetching user badges" });
    }
  });
  
  // Challenges
  app.get("/api/challenges", isAuthenticated, async (req, res) => {
    
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
  
  app.post("/api/user-challenges", isAuthenticated, async (req, res) => {
    
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
  
  app.put("/api/user-challenges/:id", isAuthenticated, async (req, res) => {
    
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
  app.get("/api/leaderboard", isAuthenticated, async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard || []); // Ensure we always send an array
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Error fetching leaderboard" });
    }
  });
  
  // Reviews
  app.get("/api/users/:userId/reviews", isAuthenticated, async (req, res) => {
    
    const userId = parseInt(req.params.userId);
    const reviews = await storage.getReviewsByUser(userId);
    res.json(reviews);
  });
  
  app.get("/api/users/:userId/rating", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const rating = await storage.getUserRating(userId);
      return res.json(rating);
    } catch (error) {
      console.error("Error fetching user rating:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviewerId = req.user!.id;
      
      // Make sure the user can't review themselves
      if (reviewerId === req.body.reviewedUserId) {
        return res.status(400).json({ message: "You cannot review yourself" });
      }
      
      // Create the review
      const review = await storage.createReview({
        ...req.body,
        reviewerId
      });
      
      return res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // (removed duplicate skill matches endpoint)
  
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
  
  // Groups
  // Group routes are handled below in the "// Group routes" section

  app.post("/api/groups/:groupId/join", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const groupId = parseInt(req.params.groupId);
    
    const member = await storage.addGroupMember({
      groupId,
      userId,
      role: "member"
    });
    
    res.status(201).json(member);
  });

  // =========================================
  // Group routes
  // =========================================
  app.get("/api/groups", isAuthenticated, async (req, res) => {
    try {
      const isTeamProject = req.query.isTeamProject === 'true';
      const groups = await storage.getAllGroups();
      
      // Filter groups by type (team project or study group)
      const filteredGroups = groups.filter(group => 
        isTeamProject ? group.isTeamProject === true : group.isTeamProject === false
      );
      
      // For each group, get the member count
      const enrichedGroups = await Promise.all(filteredGroups.map(async (group) => {
        const members = await storage.getGroupMembers(group.id);
        return {
          ...group,
          memberCount: members.length
        };
      }));
      
      res.json(enrichedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });
  
  app.get("/api/groups/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const isTeamProject = req.query.isTeamProject === 'true';
      const allGroups = await storage.getAllGroups();
      
      // Filter groups by type and user membership
      const userGroups = [];
      for (const group of allGroups) {
        // Skip if group type doesn't match query filter
        if (isTeamProject ? group.isTeamProject !== true : group.isTeamProject !== false) {
          continue;
        }
        
        const members = await storage.getGroupMembers(group.id);
        const isMember = members.some(member => member.userId === userId);
        
        if (isMember) {
          userGroups.push({
            ...group,
            memberCount: members.length
          });
        }
      }
      
      res.json(userGroups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      res.status(500).json({ message: "Failed to fetch user groups" });
    }
  });
  
  app.get("/api/groups/:id", isAuthenticated, async (req, res) => {
    
    const userId = req.user!.id;
    const groupId = parseInt(req.params.id);
    
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // Check if the user is a member of this group if it's private
    if (group.isPrivate) {
      const members = await storage.getGroupMembers(groupId);
      const isMember = members.some(member => member.userId === userId);
      
      if (!isMember) {
        return res.status(403).send("You don't have access to this private group");
      }
    }
    
    // Get members, files, events, and messages for the group
    const members = await storage.getGroupMembers(groupId);
    const files = await storage.getGroupFiles(groupId);
    const events = await storage.getGroupEvents(groupId);
    const messages = await storage.getGroupMessages(groupId);
    
    // Get user info for each member
    const enrichedMembers = await Promise.all(members.map(async (member) => {
      const user = await storage.getUser(member.userId);
      if (!user) return member;
      
      const { password, ...userData } = user;
      return {
        ...member,
        user: userData
      };
    }));
    
    // Get user info for each file uploader
    const enrichedFiles = await Promise.all(files.map(async (file) => {
      const uploader = await storage.getUser(file.uploadedById);
      if (!uploader) return file;
      
      const { password, ...uploaderData } = uploader;
      return {
        ...file,
        uploader: uploaderData
      };
    }));
    
    // Get user info for each event creator
    const enrichedEvents = await Promise.all(events.map(async (event) => {
      const creator = await storage.getUser(event.createdById);
      if (!creator) return event;
      
      const { password, ...creatorData } = creator;
      return {
        ...event,
        creator: creatorData
      };
    }));
    
    // Get user info for each message sender
    const enrichedMessages = await Promise.all(messages.map(async (message) => {
      const sender = await storage.getUser(message.userId);
      if (!sender) return message;
      
      const { password, ...senderData } = sender;
      return {
        ...message,
        sender: senderData
      };
    }));
    
    res.json({
      ...group,
      members: enrichedMembers,
      files: enrichedFiles,
      events: enrichedEvents,
      messages: enrichedMessages
    });
  });
  
  app.post("/api/groups", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    
    try {
      // Ensure we have isTeamProject flag set appropriately
      const isTeamProject = req.body.isTeamProject === true; 
      
      // Validate with Zod schema
      const validatedData = insertGroupSchema.parse({
        ...req.body,
        createdById: userId,
        isTeamProject: isTeamProject
      });
      
      // Create the group
      const group = await storage.createGroup(validatedData);
      
      // Add the creator as an admin
      await storage.addGroupMember({
        groupId: group.id,
        userId,
        role: 'admin'
      });
      
      res.status(201).json(group);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.put("/api/groups/:id", isAuthenticated, async (req, res) => {
    
    const userId = req.user!.id;
    const groupId = parseInt(req.params.id);
    
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // Check if the user is an admin of this group
    const members = await storage.getGroupMembers(groupId);
    const userMember = members.find(member => member.userId === userId);
    
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).send("You need to be an admin to update this group");
    }
    
    const updatedGroup = await storage.updateGroup(groupId, req.body);
    res.json(updatedGroup);
  });
  
  // Route for deleting a group
  app.delete("/api/groups/:id", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const groupId = parseInt(req.params.id);
    
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // Only the creator should be able to delete a group
    if (group.createdById !== userId) {
      return res.status(403).send("Only the creator can delete this group");
    }
    
    const success = await storage.deleteGroup(groupId);
    
    if (success) {
      // Add an activity for deleting the group
      await storage.createActivity({
        userId,
        type: "group",
        description: `Deleted the group: ${group.name}`,
        pointsEarned: 0
      });
      
      res.status(200).send({ message: "Group deleted successfully" });
    } else {
      res.status(500).send({ message: "Failed to delete group" });
    }
  });
  
  // Route for joining a group
  app.post("/api/groups/:id/join", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const groupId = parseInt(req.params.id);
    
    // Make sure group exists
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // Check if user is the creator of the group
    if (group.createdById === userId) {
      return res.status(400).json({ message: "You cannot join a group you created" });
    }
    
    // Check if already a member
    const members = await storage.getGroupMembers(groupId);
    const existingMember = members.find(member => member.userId === userId);
    
    if (existingMember) {
      return res.status(400).json({ message: "Already a member of this group" });
    }
    
    try {
      // For private groups, join requests would need admin approval
      // For now we allow direct joining
      const role = 'member';
      
      // Add user as a member
      const member = await storage.addGroupMember({
        groupId,
        userId,
        role
      });
      
      // Create activity for joining group
      await storage.createActivity({
        userId,
        type: 'group',
        description: `Joined the group "${group.name}"`,
        pointsEarned: 10
      });
      
      // Get user data to return
      const user = await storage.getUser(userId);
      if (user) {
        const { password, ...userData } = user;
        res.status(201).json({
          ...member,
          user: userData,
          group
        });
      } else {
        res.status(201).json(member);
      }
    } catch (error) {
      console.error("Error joining group:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // =========================================
  // Group Member routes
  // =========================================
  app.get("/api/groups/:groupId/members", isAuthenticated, async (req, res) => {
    
    const userId = req.user!.id;
    const groupId = parseInt(req.params.groupId);
    
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // Check if the user is a member of this group if it's private
    if (group.isPrivate) {
      const members = await storage.getGroupMembers(groupId);
      const isMember = members.some(member => member.userId === userId);
      
      if (!isMember) {
        return res.status(403).send("You don't have access to this private group");
      }
    }
    
    const members = await storage.getGroupMembers(groupId);
    
    // Get user info for each member
    const enrichedMembers = await Promise.all(members.map(async (member) => {
      const user = await storage.getUser(member.userId);
      if (!user) return member;
      
      const { password, ...userData } = user;
      return {
        ...member,
        user: userData
      };
    }));
    
    res.json(enrichedMembers);
  });
  
  app.post("/api/groups/:groupId/members", isAuthenticated, async (req, res) => {
    
    const userId = req.user!.id;
    const groupId = parseInt(req.params.groupId);
    
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // If joining self to group, check if group is private
    let targetUserId = req.body.userId || userId;
    
    if (targetUserId !== userId) {
      // If adding someone else, check if current user is admin
      const members = await storage.getGroupMembers(groupId);
      const userMember = members.find(member => member.userId === userId);
      
      if (!userMember || userMember.role !== 'admin') {
        return res.status(403).send("You need to be an admin to add others to this group");
      }
    }
    
    // Check if user is already a member
    const members = await storage.getGroupMembers(groupId);
    const existingMember = members.find(member => member.userId === targetUserId);
    if (existingMember) {
      return res.status(400).send("User is already a member of this group");
    }
    
    try {
      // Validate with Zod schema
      // Ensure role is always a string
      const role: string = targetUserId === userId ? 'member' : (req.body.role || 'member');
      
      const validatedData = insertGroupMemberSchema.parse({
        groupId,
        userId: targetUserId,
        role
      });
      
      // Add the member
      const member = await storage.addGroupMember({
        groupId: validatedData.groupId,
        userId: validatedData.userId,
        role: validatedData.role as string
      });
      
      // Get user info
      const user = await storage.getUser(targetUserId);
      if (user) {
        const { password, ...userData } = user;
        
        res.status(201).json({
          ...member,
          user: userData
        });
      } else {
        res.status(201).json(member);
      }
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.delete("/api/groups/:groupId/members/:userId", isAuthenticated, async (req, res) => {
    
    const currentUserId = req.user!.id;
    const groupId = parseInt(req.params.groupId);
    const targetUserId = parseInt(req.params.userId);
    
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // Get members to check permissions
    const members = await storage.getGroupMembers(groupId);
    
    // If removing someone else, check if current user is admin
    if (targetUserId !== currentUserId) {
      const userMember = members.find(member => member.userId === currentUserId);
      
      if (!userMember || userMember.role !== 'admin') {
        return res.status(403).send("You need to be an admin to remove others from this group");
      }
    }
    
    // Don't allow removing the creator if they're the last admin
    if (group.createdById === targetUserId) {
      const admins = members.filter(member => member.role === 'admin');
      
      if (admins.length === 1 && admins[0].userId === targetUserId) {
        return res.status(400).send("Cannot remove the only admin from the group");
      }
    }
    
    const success = await storage.removeGroupMember(groupId, targetUserId);
    
    if (success) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).send("Member not found");
    }
  });
  
  // =========================================
  // Group Files routes
  // =========================================
  app.get("/api/groups/:groupId/files", isAuthenticated, async (req, res) => {
    
    const userId = req.user!.id;
    const groupId = parseInt(req.params.groupId);
    
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // Check if the user is a member of this group if it's private
    if (group.isPrivate) {
      const members = await storage.getGroupMembers(groupId);
      const isMember = members.some(member => member.userId === userId);
      
      if (!isMember) {
        return res.status(403).send("You don't have access to this private group");
      }
    }
    
    const files = await storage.getGroupFiles(groupId);
    
    // Get uploader info for each file
    const enrichedFiles = await Promise.all(files.map(async (file) => {
      const uploader = await storage.getUser(file.uploadedById);
      if (!uploader) return file;
      
      const { password, ...uploaderData } = uploader;
      return {
        ...file,
        uploader: uploaderData
      };
    }));
    
    res.json(enrichedFiles);
  });
  
  app.post("/api/groups/:groupId/files", isAuthenticated, async (req, res) => {
    
    const userId = req.user!.id;
    const groupId = parseInt(req.params.groupId);
    
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // Check if the user is a member of this group
    const members = await storage.getGroupMembers(groupId);
    const isMember = members.some(member => member.userId === userId);
    
    if (!isMember) {
      return res.status(403).send("You need to be a member to upload files to this group");
    }
    
    try {
      // Validate with Zod schema
      const validatedData = insertGroupFileSchema.parse({
        ...req.body,
        groupId,
        uploadedById: userId
      });
      
      // Add the file
      const file = await storage.addGroupFile(validatedData);
      
      // Get uploader info
      const uploader = await storage.getUser(userId);
      if (uploader) {
        const { password, ...uploaderData } = uploader;
        
        res.status(201).json({
          ...file,
          uploader: uploaderData
        });
      } else {
        res.status(201).json(file);
      }
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // =========================================
  // Group Events routes
  // =========================================
  app.get("/api/groups/:groupId/events", isAuthenticated, async (req, res) => {
    
    const userId = req.user!.id;
    const groupId = parseInt(req.params.groupId);
    
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // Check if the user is a member of this group if it's private
    if (group.isPrivate) {
      const members = await storage.getGroupMembers(groupId);
      const isMember = members.some(member => member.userId === userId);
      
      if (!isMember) {
        return res.status(403).send("You don't have access to this private group");
      }
    }
    
    const events = await storage.getGroupEvents(groupId);
    
    // Get creator info for each event
    const enrichedEvents = await Promise.all(events.map(async (event) => {
      const creator = await storage.getUser(event.createdById);
      if (!creator) return event;
      
      const { password, ...creatorData } = creator;
      return {
        ...event,
        creator: creatorData
      };
    }));
    
    res.json(enrichedEvents);
  });
  
  app.post("/api/groups/:groupId/events", isAuthenticated, async (req, res) => {
    
    const userId = req.user!.id;
    const groupId = parseInt(req.params.groupId);
    
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // Check if the user is a member of this group
    const members = await storage.getGroupMembers(groupId);
    const isMember = members.some(member => member.userId === userId);
    
    if (!isMember) {
      return res.status(403).send("You need to be a member to create events in this group");
    }
    
    try {
      // Validate with Zod schema
      // Prepare event data with proper types
      const eventData = {
        title: req.body.title as string,
        groupId,
        createdById: userId,
        startTime: new Date(req.body.startTime),
        // Handle nullable fields correctly
        description: req.body.description ? String(req.body.description) : undefined,
        endTime: req.body.endTime ? new Date(req.body.endTime) : undefined
      };
      
      const validatedData = insertGroupEventSchema.parse(eventData);
      
      // Create the event
      const event = await storage.createGroupEvent({
        groupId: validatedData.groupId,
        createdById: validatedData.createdById,
        title: validatedData.title,
        startTime: validatedData.startTime,
        description: validatedData.description as string | undefined,
        endTime: validatedData.endTime ? validatedData.endTime : undefined
      });
      
      // Get creator info
      const creator = await storage.getUser(userId);
      if (creator) {
        const { password, ...creatorData } = creator;
        
        res.status(201).json({
          ...event,
          creator: creatorData
        });
      } else {
        res.status(201).json(event);
      }
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // =========================================
  // Group Messages routes
  // =========================================
  app.get("/api/groups/:groupId/messages", isAuthenticated, async (req, res) => {
    
    const userId = req.user!.id;
    const groupId = parseInt(req.params.groupId);
    
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // Check if the user is a member of this group
    const members = await storage.getGroupMembers(groupId);
    const isMember = members.some(member => member.userId === userId);
    
    if (!isMember) {
      return res.status(403).send("You need to be a member to view messages in this group");
    }
    
    const messages = await storage.getGroupMessages(groupId);
    
    // Get sender info for each message
    const enrichedMessages = await Promise.all(messages.map(async (message) => {
      const sender = await storage.getUser(message.userId);
      if (!sender) return message;
      
      const { password, ...senderData } = sender;
      return {
        ...message,
        sender: senderData
      };
    }));
    
    res.json(enrichedMessages);
  });
  
  app.post("/api/groups/:groupId/messages", isAuthenticated, async (req, res) => {
    
    const userId = req.user!.id;
    const groupId = parseInt(req.params.groupId);
    
    const group = await storage.getGroup(groupId);
    if (!group) return res.status(404).send("Group not found");
    
    // Check if the user is a member of this group
    const members = await storage.getGroupMembers(groupId);
    const isMember = members.some(member => member.userId === userId);
    
    if (!isMember) {
      return res.status(403).send("You need to be a member to send messages in this group");
    }
    
    try {
      // Validate with Zod schema
      const validatedData = insertGroupMessageSchema.parse({
        groupId,
        userId,
        content: req.body.content
      });
      
      // Create the message
      const message = await storage.createGroupMessage(validatedData);
      
      // Get sender info
      const sender = await storage.getUser(userId);
      if (sender) {
        const { password, ...senderData } = sender;
        
        res.status(201).json({
          ...message,
          sender: senderData
        });
      } else {
        res.status(201).json(message);
      }
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Combined authentication endpoint that accepts both Firebase and token authentication
  app.get("/api/user", async (req, res) => {
    // First try token-based auth
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const userId = userTokens.get(token);
      if (userId) {
        const user = await storage.getUser(userId);
        if (user) {
          const { password, ...userData } = user;
          return res.json(userData);
        }
      }
    }
    
    // Then try Firebase auth
    const firebaseUid = req.headers['x-firebase-uid'] as string;
    if (firebaseUid) {
      const userId = firebaseUsers.get(firebaseUid);
      if (userId) {
        const user = await storage.getUser(userId);
        if (user) {
          const { password, ...userData } = user;
          return res.json(userData);
        }
      }
    }
    
    // Not authenticated
    return res.status(401).json({ message: "Authentication required" });
  });
  
  // Register admin routes
  app.use("/api/admin", adminRouter);

  // Create the HTTP server
  const httpServer = createServer(app);
  
  // Set up websockets
  setupWebSockets(httpServer);

  return httpServer;
}
