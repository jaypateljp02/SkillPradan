import { 
  User, InsertUser, 
  Skill, InsertSkill, 
  Exchange, InsertExchange, 
  Session, InsertSession, 
  Activity, InsertActivity, 
  Badge, InsertBadge,
  UserBadge, InsertUserBadge,
  Challenge, InsertChallenge,
  UserChallenge, InsertUserChallenge
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

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
  sessionStore: session.SessionStore;
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
  
  private userIdCounter: number;
  private skillIdCounter: number;
  private exchangeIdCounter: number;
  private sessionIdCounter: number;
  private activityIdCounter: number;
  private badgeIdCounter: number;
  private userBadgeIdCounter: number;
  private challengeIdCounter: number;
  private userChallengeIdCounter: number;
  
  sessionStore: session.SessionStore;

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
    
    this.userIdCounter = 1;
    this.skillIdCounter = 1;
    this.exchangeIdCounter = 1;
    this.sessionIdCounter = 1;
    this.activityIdCounter = 1;
    this.badgeIdCounter = 1;
    this.userBadgeIdCounter = 1;
    this.challengeIdCounter = 1;
    this.userChallengeIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
    
    // Initialize with some pre-defined badges and challenges
    this.initPredefinedData();
  }
  
  private initPredefinedData() {
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
      ...insertUser, 
      id, 
      points: 0, 
      level: 1, 
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
    const newSkill: Skill = { ...skill, id, createdAt: now };
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
      ...exchange, 
      id, 
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
      ...sessionData, 
      id, 
      notes: "", 
      whiteboardData: null, 
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
    const newActivity: Activity = { ...activity, id, createdAt: now };
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
    const newBadge: Badge = { ...badge, id };
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
    const newChallenge: Challenge = { ...challenge, id };
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
  
  // Leaderboard
  async getLeaderboard(): Promise<{id: number, name: string, university: string, exchanges: number, points: number, avatar: string}[]> {
    // Get all users
    const allUsers = Array.from(this.users.values());
    
    // Count exchanges for each user
    const userExchanges = new Map<number, number>();
    
    for (const exchange of this.exchanges.values()) {
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
      points: user.points,
      avatar: user.avatar || ""
    }));
    
    // Sort by points (descending)
    return leaderboard.sort((a, b) => b.points - a.points);
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
          // Calculate a match percentage (simplified for demo)
          const matchPercentage = Math.floor(Math.random() * 30) + 65; // 65% to 95%
          
          matches.push({
            userId: otherUser.id,
            username: otherUser.username,
            name: otherUser.name,
            avatar: otherUser.avatar || "",
            university: otherUser.university || "",
            rating: 4.5 + (Math.random() * 0.5), // 4.5 to 5.0 rating
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
