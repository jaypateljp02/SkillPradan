import { 
  User, InsertUser, 
  Skill, InsertSkill, 
  Exchange, InsertExchange, 
  Session, InsertSession, 
  Activity, InsertActivity, 
  Badge, InsertBadge,
  UserBadge, InsertUserBadge,
  Challenge, InsertChallenge,
  UserChallenge, InsertUserChallenge,
  Review, InsertReview,
  Group, GroupMember, GroupEvent, GroupFile, GroupMessage
} from "@shared/schema";
import session from "express-session";
import type { Store as SessionStore } from "express-session";
import createMemoryStore from "memorystore";
import { hashPassword } from "./token-auth";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Skill operations
  getSkill(id: number): Promise<Skill | undefined>;
  getSkillsByUser(userId: number): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skillData: Partial<Skill>): Promise<Skill | undefined>;
  
  // Exchange operations
  getExchange(id: number): Promise<Exchange | undefined>;
  getExchangesByUser(userId: number): Promise<Exchange[]>;
  createExchange(exchange: InsertExchange): Promise<Exchange>;
  updateExchange(id: number, exchangeData: Partial<Exchange>): Promise<Exchange | undefined>;
  
  // Session operations
  getSession(id: number): Promise<Session | undefined>;
  getSessionsByExchange(exchangeId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, sessionData: Partial<Session>): Promise<Session | undefined>;
  
  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByUser(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Badge operations
  getBadge(id: number): Promise<Badge | undefined>;
  getAllBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // UserBadge operations
  getUserBadges(userId: number): Promise<UserBadge[]>;
  createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
  
  // Challenge operations
  getChallenge(id: number): Promise<Challenge | undefined>;
  getAllChallenges(): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  
  // UserChallenge operations
  getUserChallenges(userId: number): Promise<UserChallenge[]>;
  createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge>;
  updateUserChallenge(id: number, data: Partial<UserChallenge>): Promise<UserChallenge | undefined>;
  
  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getUserRating(userId: number): Promise<{ rating: number, count: number }>;
  
  // Group operations
  getGroup(id: number): Promise<Group | undefined>;
  getAllGroups(): Promise<Group[]>;
  getGroupsByUser(userId: number): Promise<Group[]>;
  createGroup(groupData: Partial<Group>): Promise<Group>;
  updateGroup(id: number, groupData: Partial<Group>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  
  // Group member operations
  getGroupMember(id: number): Promise<GroupMember | undefined>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  addGroupMember(memberData: { groupId: number, userId: number, role: string }): Promise<GroupMember>;
  removeGroupMember(groupId: number, userId: number): Promise<boolean>;
  
  // Group file operations
  getGroupFile(id: number): Promise<GroupFile | undefined>;
  getGroupFiles(groupId: number): Promise<GroupFile[]>;
  addGroupFile(fileData: { groupId: number, uploadedById: number, name: string, type: string, url: string }): Promise<GroupFile>;
  
  // Group event operations
  getGroupEvent(id: number): Promise<GroupEvent | undefined>;
  getGroupEvents(groupId: number): Promise<GroupEvent[]>;
  createGroupEvent(eventData: { groupId: number, createdById: number, title: string, description?: string, startTime: Date, endTime?: Date }): Promise<GroupEvent>;
  
  // Group message operations
  getGroupMessages(groupId: number): Promise<GroupMessage[]>;
  createGroupMessage(messageData: { groupId: number, userId: number, content: string }): Promise<GroupMessage>;
  
  // Leaderboard
  getLeaderboard(): Promise<{id: number, name: string, university: string, exchanges: number, points: number, avatar: string}[]>;
  
  // Find potential skill matches
  findSkillMatches(teachingSkillId: number, learningSkillId: number): Promise<{
    userId: number,
    username: string,
    name: string,
    avatar: string,
    university: string,
    rating: number,
    teachingSkill: {id: number, name: string},
    learningSkill: {id: number, name: string},
    matchPercentage: number
  }[]>;
  
  // Session store for authentication
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skills: Map<number, Skill>;
  private exchanges: Map<number, Exchange>;
  private sessions: Map<number, Session>;
  private activities: Map<number, Activity>;
  private badges: Map<number, Badge>;
  private userBadges: Map<number, UserBadge>;
  private challenges: Map<number, Challenge>;
  private userChallenges: Map<number, UserChallenge>;
  private reviews: Map<number, Review>;
  private groups: Map<number, Group>;
  private groupMembers: Map<number, GroupMember>;
  private groupEvents: Map<number, GroupEvent>;
  private groupFiles: Map<number, GroupFile>;
  private groupMessages: Map<number, GroupMessage>;
  
  private userIdCounter: number;
  private skillIdCounter: number;
  private exchangeIdCounter: number;
  private sessionIdCounter: number;
  private activityIdCounter: number;
  private badgeIdCounter: number;
  private userBadgeIdCounter: number;
  private challengeIdCounter: number;
  private userChallengeIdCounter: number;
  private reviewIdCounter: number;
  private groupIdCounter: number;
  private groupMemberIdCounter: number;
  private groupEventIdCounter: number;
  private groupFileIdCounter: number;
  private groupMessageIdCounter: number;
  
  sessionStore: SessionStore;

  constructor() {
    this.users = new Map();
    this.skills = new Map();
    this.exchanges = new Map();
    this.sessions = new Map();
    this.activities = new Map();
    this.badges = new Map();
    this.userBadges = new Map();
    this.challenges = new Map();
    this.userChallenges = new Map();
    this.reviews = new Map();
    this.groups = new Map();
    this.groupMembers = new Map();
    this.groupEvents = new Map();
    this.groupFiles = new Map();
    this.groupMessages = new Map();
    
    this.userIdCounter = 1;
    this.skillIdCounter = 1;
    this.exchangeIdCounter = 1;
    this.sessionIdCounter = 1;
    this.activityIdCounter = 1;
    this.badgeIdCounter = 1;
    this.userBadgeIdCounter = 1;
    this.challengeIdCounter = 1;
    this.userChallengeIdCounter = 1;
    this.reviewIdCounter = 1;
    this.groupIdCounter = 1;
    this.groupMemberIdCounter = 1;
    this.groupEventIdCounter = 1;
    this.groupFileIdCounter = 1;
    this.groupMessageIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
    
    // Initialize with some pre-defined badges and challenges
    this.initPredefinedData();
  }
  
  private async initPredefinedData() {
    console.log("Initializing predefined data in storage...");
    
    // Add some badges
    const badges = [
      { name: "JavaScript Guru", description: "Advanced proficiency in JavaScript", icon: "fa-js-square", pointsAwarded: 50 },
      { name: "React Master", description: "Component expert in React", icon: "fa-react", pointsAwarded: 50 },
      { name: "Mentor Star", description: "5+ successful teachings", icon: "fa-chalkboard-teacher", pointsAwarded: 100 },
      { name: "Code Collaborator", description: "Team player", icon: "fa-code-branch", pointsAwarded: 30 },
      { name: "Streak Master", description: "14 day activity streak", icon: "fa-fire", pointsAwarded: 25 }
    ];
    
    badges.forEach(badge => {
      this.createBadge({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        pointsAwarded: badge.pointsAwarded
      });
    });
    
    // Add some challenges
    const challenges = [
      { title: "Weekly Exchange Challenge", description: "Complete 3 skill exchanges this week", targetCount: 3, type: "exchange", pointsRewarded: 200, durationDays: 7 },
      { title: "Skill Verification Challenge", description: "Verify your skills in 2 new areas", targetCount: 2, type: "verification", pointsRewarded: 100, durationDays: 7 }
    ];
    
    challenges.forEach(challenge => {
      this.createChallenge({
        title: challenge.title,
        description: challenge.description,
        targetCount: challenge.targetCount,
        type: challenge.type,
        pointsRewarded: challenge.pointsRewarded,
        durationDays: challenge.durationDays
      });
    });
    
    // Create test users
    await this.createTestUsers();
    
    // Create test exchanges for the demo - with 2-second delay to ensure users are created
    setTimeout(async () => {
      try {
        // Check if we already have exchanges
        const existingExchanges = Array.from(this.exchanges.values());
        if (existingExchanges.length > 0) {
          console.log("Test exchanges already exist, skipping creation");
          return;
        }
        
        // Get the test users
        const testUser = await this.getUserByUsername("testuser");
        const anotherUser = await this.getUserByUsername("student1");
        
        if (!testUser || !anotherUser) {
          console.log("Missing test users, cannot create exchanges");
          return;
        }
        
        // Create a completed exchange between testuser and student1
        const exchange = await this.createExchange({
          teacherId: testUser.id,
          studentId: anotherUser.id,
          teacherSkillId: 1, // JavaScript
          studentSkillId: 3, // Python
          status: "completed",
          totalSessions: 3,
          sessionsCompleted: 3,
          notes: "This exchange has been completed successfully."
        });
        
        // Create completed sessions
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        await this.createSession({
          exchangeId: exchange.id,
          scheduledTime: twoWeeksAgo,
          duration: 60,
          status: "completed",
          notes: "First session went well. Covered basics."
        });
        
        await this.createSession({
          exchangeId: exchange.id,
          scheduledTime: oneWeekAgo,
          duration: 45,
          status: "completed",
          notes: "Second session focused on advanced topics."
        });
        
        await this.createSession({
          exchangeId: exchange.id,
          scheduledTime: yesterday,
          duration: 90,
          status: "completed",
          notes: "Final session with full project review.",
          whiteboardData: { content: "Sample whiteboard data with diagrams" }
        });
        
        console.log("Created test exchange and sessions for demo");
      } catch (error) {
        console.error("Error creating test exchanges:", error);
      }
    }, 2000);
  }
  
  private async createTestUsers() {
    try {
      // Secure password for testing
      const testPassword = await hashPassword("password123");
      const adminPassword = await hashPassword("adminpass");
      
      // Check if we already have test users
      const existingUser = await this.getUserByUsername("testuser");
      if (existingUser) {
        console.log("Test users already exist, skipping creation");
        return;
      }
      
      console.log("Creating test users...");
      
      // Create admin user
      const adminUser = await this.createUser({
        username: "admin",
        password: adminPassword, // Using specific admin password
        name: "Admin User",
        email: "admin@example.com",
        university: "Admin University",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        isAdmin: true
      });
      
      console.log("Created admin user:", adminUser.id);
      
      // Create first test user
      const testUser = await this.createUser({
        username: "testuser",
        password: testPassword,
        name: "Test User",
        email: "test@example.com",
        university: "Test University",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser"
      });
      
      console.log("Created test user:", testUser.id);
      
      // Create another user for testing interactions
      const anotherUser = await this.createUser({
        username: "student1",
        password: testPassword,
        name: "Student One",
        email: "student1@example.com",
        university: "Another University",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student1"
      });
      
      console.log("Created another test user:", anotherUser.id);
      
      // Add some skills for these users
      await this.createSkill({
        userId: testUser.id,
        name: "JavaScript",
        proficiencyLevel: "expert",
        isTeaching: true
      });
      
      await this.createSkill({
        userId: testUser.id,
        name: "Python",
        proficiencyLevel: "beginner",
        isTeaching: false
      });
      
      await this.createSkill({
        userId: anotherUser.id,
        name: "Python",
        proficiencyLevel: "expert",
        isTeaching: true
      });
      
      await this.createSkill({
        userId: anotherUser.id,
        name: "JavaScript",
        proficiencyLevel: "beginner",
        isTeaching: false
      });
      
      // Create a third user with matching skills - wants to teach Python and learn JavaScript
      const matchUser = await this.createUser({
        username: "matchuser",
        password: testPassword,
        name: "Match User",
        email: "match@example.com",
        university: "Match University",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=matchuser"
      });
      
      console.log("Created match test user:", matchUser.id);
      
      await this.createSkill({
        userId: matchUser.id,
        name: "Python",
        proficiencyLevel: "expert",
        isTeaching: true
      });
      
      await this.createSkill({
        userId: matchUser.id,
        name: "JavaScript",
        proficiencyLevel: "beginner",
        isTeaching: false
      });
      
      console.log("Added skills to test users");
    } catch (error) {
      console.error("Error creating test users:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      id, 
      username: insertUser.username,
      password: insertUser.password,
      name: insertUser.name,
      email: insertUser.email,
      university: insertUser.university || "",
      avatar: insertUser.avatar || "",
      points: 0, 
      level: 1, 
      isAdmin: insertUser.isAdmin || false,
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Skill operations
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }
  
  async getSkillsByUser(userId: number): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.userId === userId
    );
  }
  
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const id = this.skillIdCounter++;
    const now = new Date();
    const newSkill: Skill = { 
      id,
      name: skill.name,
      createdAt: now,
      userId: skill.userId,
      isVerified: skill.isVerified || false,
      proficiencyLevel: skill.proficiencyLevel || "beginner",
      isTeaching: skill.isTeaching
    };
    this.skills.set(id, newSkill);
    return newSkill;
  }
  
  async updateSkill(id: number, skillData: Partial<Skill>): Promise<Skill | undefined> {
    const skill = await this.getSkill(id);
    if (!skill) return undefined;
    
    const updatedSkill = { ...skill, ...skillData };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }

  // Exchange operations
  async getExchange(id: number): Promise<Exchange | undefined> {
    return this.exchanges.get(id);
  }
  
  async getExchangesByUser(userId: number): Promise<Exchange[]> {
    return Array.from(this.exchanges.values()).filter(
      (exchange) => exchange.teacherId === userId || exchange.studentId === userId
    );
  }
  
  async createExchange(exchange: InsertExchange): Promise<Exchange> {
    const id = this.exchangeIdCounter++;
    const now = new Date();
    const newExchange: Exchange = { 
      id, 
      teacherId: exchange.teacherId,
      studentId: exchange.studentId,
      teacherSkillId: exchange.teacherSkillId,
      studentSkillId: exchange.studentSkillId,
      status: exchange.status || "pending",
      sessionsCompleted: 0, 
      totalSessions: 3, 
      createdAt: now 
    };
    this.exchanges.set(id, newExchange);
    return newExchange;
  }
  
  async updateExchange(id: number, exchangeData: Partial<Exchange>): Promise<Exchange | undefined> {
    const exchange = await this.getExchange(id);
    if (!exchange) return undefined;
    
    const updatedExchange = { ...exchange, ...exchangeData };
    this.exchanges.set(id, updatedExchange);
    return updatedExchange;
  }

  // Session operations
  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }
  
  async getSessionsByExchange(exchangeId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.exchangeId === exchangeId
    );
  }
  
  async createSession(sessionData: InsertSession): Promise<Session> {
    const id = this.sessionIdCounter++;
    const now = new Date();
    const newSession: Session = { 
      id, 
      exchangeId: sessionData.exchangeId,
      scheduledTime: sessionData.scheduledTime,
      duration: sessionData.duration || 60,
      status: sessionData.status || "scheduled",
      notes: "", 
      whiteboardData: {}, 
      createdAt: now 
    };
    this.sessions.set(id, newSession);
    return newSession;
  }
  
  async updateSession(id: number, sessionData: Partial<Session>): Promise<Session | undefined> {
    const session = await this.getSession(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...sessionData };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const newActivity: Activity = { 
      id, 
      createdAt: now,
      userId: activity.userId,
      type: activity.type,
      description: activity.description,
      pointsEarned: activity.pointsEarned || 0
    };
    this.activities.set(id, newActivity);
    
    // Update user points
    if (activity.pointsEarned) {
      const user = await this.getUser(activity.userId);
      if (user) {
        const updatedPoints = user.points + activity.pointsEarned;
        const updatedLevel = Math.floor(updatedPoints / 500) + 1; // Simple level formula
        await this.updateUser(user.id, { 
          points: updatedPoints,
          level: updatedLevel
        });
      }
    }
    
    return newActivity;
  }

  // Badge operations
  async getBadge(id: number): Promise<Badge | undefined> {
    return this.badges.get(id);
  }
  
  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }
  
  async createBadge(badge: InsertBadge): Promise<Badge> {
    const id = this.badgeIdCounter++;
    const newBadge: Badge = { 
      id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      pointsAwarded: badge.pointsAwarded || 0
    };
    this.badges.set(id, newBadge);
    return newBadge;
  }

  // UserBadge operations
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values()).filter(
      (userBadge) => userBadge.userId === userId
    );
  }
  
  async createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge> {
    const id = this.userBadgeIdCounter++;
    const now = new Date();
    const newUserBadge: UserBadge = { ...userBadge, id, earnedAt: now };
    this.userBadges.set(id, newUserBadge);
    
    // Also create an activity for earning the badge
    const badge = await this.getBadge(userBadge.badgeId);
    if (badge) {
      await this.createActivity({
        userId: userBadge.userId,
        type: "badge",
        description: `Earned the ${badge.name} badge`,
        pointsEarned: badge.pointsAwarded
      });
    }
    
    return newUserBadge;
  }

  // Challenge operations
  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }
  
  async getAllChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }
  
  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeIdCounter++;
    const newChallenge: Challenge = { 
      id,
      type: challenge.type,
      title: challenge.title,
      description: challenge.description,
      targetCount: challenge.targetCount,
      pointsRewarded: challenge.pointsRewarded,
      durationDays: challenge.durationDays || 7
    };
    this.challenges.set(id, newChallenge);
    return newChallenge;
  }

  // UserChallenge operations
  async getUserChallenges(userId: number): Promise<UserChallenge[]> {
    return Array.from(this.userChallenges.values()).filter(
      (userChallenge) => userChallenge.userId === userId
    );
  }
  
  async createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const id = this.userChallengeIdCounter++;
    const now = new Date();
    const newUserChallenge: UserChallenge = { 
      ...userChallenge, 
      id, 
      currentCount: 0, 
      startedAt: now, 
      completedAt: null 
    };
    this.userChallenges.set(id, newUserChallenge);
    return newUserChallenge;
  }
  
  async updateUserChallenge(id: number, data: Partial<UserChallenge>): Promise<UserChallenge | undefined> {
    const userChallenge = await this.userChallenges.get(id);
    if (!userChallenge) return undefined;
    
    const updatedUserChallenge = { ...userChallenge, ...data };
    this.userChallenges.set(id, updatedUserChallenge);
    
    // If the challenge is completed, add an activity and award points
    if (data.completedAt && !userChallenge.completedAt) {
      const challenge = await this.getChallenge(userChallenge.challengeId);
      if (challenge) {
        await this.createActivity({
          userId: userChallenge.userId,
          type: "challenge",
          description: `Completed the ${challenge.title} challenge`,
          pointsEarned: challenge.pointsRewarded
        });
      }
    }
    
    return updatedUserChallenge;
  }
  
  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.reviewedUserId === userId
    );
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const newReview: Review = { 
      id, 
      exchangeId: review.exchangeId,
      reviewerId: review.reviewerId,
      reviewedUserId: review.reviewedUserId,
      rating: review.rating,
      comment: review.comment || null,
      createdAt: now 
    };
    this.reviews.set(id, newReview);
    
    // Add an activity for the person being reviewed
    await this.createActivity({
      userId: review.reviewedUserId,
      type: "review",
      description: `Received a ${review.rating}-star review`,
      pointsEarned: 5 // Small points bonus for getting reviewed
    });
    
    return newReview;
  }
  
  async getUserRating(userId: number): Promise<{ rating: number, count: number }> {
    const reviews = await this.getReviewsByUser(userId);
    
    if (reviews.length === 0) {
      return { rating: 0, count: 0 };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    return { 
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      count: reviews.length 
    };
  }

  // Group operations
  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }
  
  async getAllGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }
  
  async getGroupsByUser(userId: number): Promise<Group[]> {
    // Get all group members for this user
    const userMemberships = Array.from(this.groupMembers.values()).filter(
      member => member.userId === userId
    );
    
    // Get the groups the user is a member of
    const groupIds = userMemberships.map(membership => membership.groupId);
    return Array.from(this.groups.values()).filter(
      group => groupIds.includes(group.id)
    );
  }
  
  async createGroup(groupData: Partial<Group>): Promise<Group> {
    const id = this.groupIdCounter++;
    const now = new Date();
    
    const newGroup: Group = {
      id,
      name: groupData.name || '',
      description: groupData.description || null,
      isPrivate: groupData.isPrivate || false,
      isTeamProject: groupData.isTeamProject || false,
      createdAt: now,
      createdById: groupData.createdById || 0
    };
    
    this.groups.set(id, newGroup);
    
    // Add activity for the user who created the group
    await this.createActivity({
      userId: newGroup.createdById,
      type: "group",
      description: `Created a new study group: ${newGroup.name}`,
      pointsEarned: 10 // Small bonus for creating a group
    });
    
    return newGroup;
  }
  
  async updateGroup(id: number, groupData: Partial<Group>): Promise<Group | undefined> {
    const group = await this.getGroup(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...groupData };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }
  
  async deleteGroup(id: number): Promise<boolean> {
    // Check if group exists
    const group = await this.getGroup(id);
    if (!group) return false;
    
    // Delete the group
    this.groups.delete(id);
    
    // Remove all group members
    const groupMembers = Array.from(this.groupMembers.values())
      .filter(member => member.groupId === id);
      
    for (const member of groupMembers) {
      this.groupMembers.delete(member.id);
    }
    
    // Remove all group files
    const groupFiles = Array.from(this.groupFiles.values())
      .filter(file => file.groupId === id);
      
    for (const file of groupFiles) {
      this.groupFiles.delete(file.id);
    }
    
    // Remove all group events
    const groupEvents = Array.from(this.groupEvents.values())
      .filter(event => event.groupId === id);
      
    for (const event of groupEvents) {
      this.groupEvents.delete(event.id);
    }
    
    // Remove all group messages
    const groupMessages = Array.from(this.groupMessages.values())
      .filter(message => message.groupId === id);
      
    for (const message of groupMessages) {
      this.groupMessages.delete(message.id);
    }
    
    return true;
  }

  // Group member operations
  async getGroupMember(id: number): Promise<GroupMember | undefined> {
    return this.groupMembers.get(id);
  }
  
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return Array.from(this.groupMembers.values()).filter(
      member => member.groupId === groupId
    );
  }
  
  async addGroupMember(memberData: { groupId: number, userId: number, role: string }): Promise<GroupMember> {
    const id = this.groupMemberIdCounter++;
    const now = new Date();
    
    const newMember: GroupMember = {
      id,
      groupId: memberData.groupId,
      userId: memberData.userId,
      role: memberData.role,
      joinedAt: now
    };
    
    this.groupMembers.set(id, newMember);
    
    // Add activity for joining a group (only if not the creator)
    const group = await this.getGroup(memberData.groupId);
    if (group && group.createdById !== memberData.userId) {
      await this.createActivity({
        userId: memberData.userId,
        type: "group",
        description: `Joined the study group: ${group.name}`,
        pointsEarned: 5 // Small bonus for joining a group
      });
    }
    
    return newMember;
  }
  
  async removeGroupMember(groupId: number, userId: number): Promise<boolean> {
    const members = await this.getGroupMembers(groupId);
    const member = members.find(m => m.userId === userId);
    
    if (!member) return false;
    
    this.groupMembers.delete(member.id);
    return true;
  }

  // Group file operations
  async getGroupFile(id: number): Promise<GroupFile | undefined> {
    return this.groupFiles.get(id);
  }
  
  async getGroupFiles(groupId: number): Promise<GroupFile[]> {
    return Array.from(this.groupFiles.values()).filter(
      file => file.groupId === groupId
    );
  }
  
  async addGroupFile(fileData: { groupId: number, uploadedById: number, name: string, type: string, url: string }): Promise<GroupFile> {
    const id = this.groupFileIdCounter++;
    const now = new Date();
    
    const newFile: GroupFile = {
      id,
      groupId: fileData.groupId,
      name: fileData.name,
      type: fileData.type,
      url: fileData.url,
      uploadedById: fileData.uploadedById,
      uploadedAt: now
    };
    
    this.groupFiles.set(id, newFile);
    
    // Add activity for uploading a file
    const group = await this.getGroup(fileData.groupId);
    if (group) {
      await this.createActivity({
        userId: fileData.uploadedById,
        type: "group",
        description: `Uploaded file "${fileData.name}" to group: ${group.name}`,
        pointsEarned: 3 // Small bonus for contributing content
      });
    }
    
    return newFile;
  }

  // Group event operations
  async getGroupEvent(id: number): Promise<GroupEvent | undefined> {
    return this.groupEvents.get(id);
  }
  
  async getGroupEvents(groupId: number): Promise<GroupEvent[]> {
    return Array.from(this.groupEvents.values()).filter(
      event => event.groupId === groupId
    );
  }
  
  async createGroupEvent(eventData: { groupId: number, createdById: number, title: string, description?: string, startTime: Date, endTime?: Date }): Promise<GroupEvent> {
    const id = this.groupEventIdCounter++;
    
    const newEvent: GroupEvent = {
      id,
      groupId: eventData.groupId,
      title: eventData.title,
      description: eventData.description || null,
      startTime: eventData.startTime,
      endTime: eventData.endTime || null,
      createdById: eventData.createdById
    };
    
    this.groupEvents.set(id, newEvent);
    
    // Add activity for creating an event
    const group = await this.getGroup(eventData.groupId);
    if (group) {
      await this.createActivity({
        userId: eventData.createdById,
        type: "group",
        description: `Created event "${eventData.title}" in group: ${group.name}`,
        pointsEarned: 5 // Bonus for organizing an event
      });
    }
    
    return newEvent;
  }

  // Group message operations
  async getGroupMessages(groupId: number): Promise<GroupMessage[]> {
    return Array.from(this.groupMessages.values())
      .filter(message => message.groupId === groupId)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  }
  
  async createGroupMessage(messageData: { groupId: number, userId: number, content: string }): Promise<GroupMessage> {
    const id = this.groupMessageIdCounter++;
    const now = new Date();
    
    const newMessage: GroupMessage = {
      id,
      groupId: messageData.groupId,
      userId: messageData.userId,
      content: messageData.content,
      sentAt: now
    };
    
    this.groupMessages.set(id, newMessage);
    return newMessage;
  }
  
  // Leaderboard
  async getLeaderboard(): Promise<{id: number, name: string, university: string, exchanges: number, points: number, avatar: string}[]> {
    // Get all users
    const allUsers = Array.from(this.users.values());
    
    // Count exchanges for each user
    const userExchanges = new Map<number, number>();
    
    for (const exchange of Array.from(this.exchanges.values())) {
      const teacherId = exchange.teacherId;
      const studentId = exchange.studentId;
      
      if (exchange.status === "completed") {
        userExchanges.set(teacherId, (userExchanges.get(teacherId) || 0) + 1);
        userExchanges.set(studentId, (userExchanges.get(studentId) || 0) + 1);
      }
    }
    
    // Build leaderboard entries
    const leaderboard = allUsers.map(user => ({
      id: user.id,
      name: user.name,
      university: user.university || "",
      exchanges: userExchanges.get(user.id) || 0,
      points: user.points || 0,  // Handle null points
      avatar: user.avatar || ""
    }));
    
    // Sort by points (descending)
    return leaderboard.sort((a, b) => (b.points || 0) - (a.points || 0));
  }
  
  // Find potential skill matches
  async findSkillMatches(teachingSkillId: number, learningSkillId: number): Promise<{
    userId: number,
    username: string,
    name: string,
    avatar: string,
    university: string,
    rating: number,
    teachingSkill: {id: number, name: string},
    learningSkill: {id: number, name: string},
    matchPercentage: number
  }[]> {
    const matches: any[] = [];
    
    // Get the requesting user's skills
    const myTeachingSkill = await this.getSkill(teachingSkillId);
    const myLearningSkill = await this.getSkill(learningSkillId);
    
    if (!myTeachingSkill || !myLearningSkill) {
      return [];
    }
    
    const myUserId = myTeachingSkill.userId;
    
    // Get all teaching skills that match the user's learning interest
    const potentialTeachingSkills = Array.from(this.skills.values())
      .filter(skill => 
        skill.userId !== myUserId && 
        skill.isTeaching && 
        skill.name === myLearningSkill.name
      );
    
    // Get all learning skills from those users that match what the user can teach
    for (const theirTeachingSkill of potentialTeachingSkills) {
      const theirUserId = theirTeachingSkill.userId;
      
      // Get this user's learning interests
      const theirLearningSkills = Array.from(this.skills.values())
        .filter(skill => 
          skill.userId === theirUserId && 
          !skill.isTeaching
        );
      
      // Find if any of their learning interests match what I can teach
      const matchingLearningSkill = theirLearningSkills.find(
        skill => skill.name === myTeachingSkill.name
      );
      
      if (matchingLearningSkill) {
        // Get the other user
        const otherUser = await this.getUser(theirUserId);
        if (otherUser) {
          // Calculate a stable match percentage based on user ID
          // This ensures the same match always shows the same percentage
          const matchPercentage = 70 + (otherUser.id * 7) % 25; // 70% to 95% based on user ID
          
          // Get actual rating from reviews
          const { rating } = await this.getUserRating(otherUser.id);
          
          matches.push({
            userId: otherUser.id,
            username: otherUser.username,
            name: otherUser.name,
            avatar: otherUser.avatar || "",
            university: otherUser.university || "",
            rating: rating, // Rating based on user reviews
            teachingSkill: {
              id: theirTeachingSkill.id,
              name: theirTeachingSkill.name
            },
            learningSkill: {
              id: matchingLearningSkill.id,
              name: matchingLearningSkill.name
            },
            matchPercentage
          });
        }
      }
    }
    
    // Sort by match percentage
    return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }
}

export const storage = new MemStorage();
