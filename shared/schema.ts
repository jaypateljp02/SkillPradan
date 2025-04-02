import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  university: text("university").notNull().default(""),
  avatar: text("avatar").notNull().default(""),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  proficiencyLevel: text("proficiency_level").notNull().default("beginner"),
  isTeaching: boolean("is_teaching").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exchanges = pgTable("exchanges", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  studentId: integer("student_id").notNull(),
  teacherSkillId: integer("teacher_skill_id").notNull(),
  studentSkillId: integer("student_skill_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, active, completed, cancelled
  sessionsCompleted: integer("sessions_completed").notNull().default(0),
  totalSessions: integer("total_sessions").notNull().default(3),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  exchangeId: integer("exchange_id").notNull(),
  scheduledTime: timestamp("scheduled_time").notNull(),
  duration: integer("duration").notNull().default(60), // in minutes
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes").notNull().default(""),
  whiteboardData: json("whiteboard_data").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // exchange, badge, verification, quiz
  description: text("description").notNull(),
  pointsEarned: integer("points_earned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  pointsAwarded: integer("points_awarded").notNull().default(0),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetCount: integer("target_count").notNull(),
  type: text("type").notNull(), // exchange, verification
  pointsRewarded: integer("points_rewarded").notNull(),
  durationDays: integer("duration_days").notNull().default(7),
});

export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  currentCount: integer("current_count").notNull().default(0),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  exchangeId: integer("exchange_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  reviewedUserId: integer("reviewed_user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Define zod schemas for inserts
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  university: true,
  avatar: true,
  isAdmin: true,
});

export const insertSkillSchema = createInsertSchema(skills).pick({
  name: true,
  userId: true,
  isVerified: true,
  proficiencyLevel: true,
  isTeaching: true,
});

export const insertExchangeSchema = createInsertSchema(exchanges).pick({
  teacherId: true,
  studentId: true,
  teacherSkillId: true,
  studentSkillId: true,
  status: true,
  sessionsCompleted: true,
  totalSessions: true,
}).extend({
  notes: z.string().optional(),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  exchangeId: true,
  scheduledTime: true,
  duration: true,
  status: true,
}).extend({
  notes: z.string().optional(),
  whiteboardData: z.record(z.any()).optional(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  description: true,
  pointsEarned: true,
});

export const insertBadgeSchema = createInsertSchema(badges);

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  badgeId: true,
});

export const insertChallengeSchema = createInsertSchema(challenges);

export const insertUserChallengeSchema = createInsertSchema(userChallenges).pick({
  userId: true,
  challengeId: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  exchangeId: true,
  reviewerId: true,
  reviewedUserId: true,
  rating: true,
  comment: true,
});

// Define export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Exchange = typeof exchanges.$inferSelect;
export type InsertExchange = z.infer<typeof insertExchangeSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").notNull().default(false),
  isTeamProject: boolean("is_team_project").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdById: integer("created_by_id").notNull(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().default("member"), // member, admin, moderator
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const groupEvents = pgTable("group_events", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  createdById: integer("created_by_id").notNull(),
});

export const groupFiles = pgTable("group_files", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // pdf, code, etc
  url: text("url").notNull(),
  uploadedById: integer("uploaded_by_id").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const groupMessages = pgTable("group_messages", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

// Create insert schemas for group-related tables
export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
  isPrivate: true,
  isTeamProject: true,
  createdById: true
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true,
  role: true
});

export const insertGroupEventSchema = createInsertSchema(groupEvents).pick({
  groupId: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  createdById: true
});

export const insertGroupFileSchema = createInsertSchema(groupFiles).pick({
  groupId: true,
  name: true,
  type: true,
  url: true,
  uploadedById: true
});

export const insertGroupMessageSchema = createInsertSchema(groupMessages).pick({
  groupId: true,
  userId: true,
  content: true
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;

export type GroupEvent = typeof groupEvents.$inferSelect;
export type InsertGroupEvent = z.infer<typeof insertGroupEventSchema>;

export type GroupFile = typeof groupFiles.$inferSelect;
export type InsertGroupFile = z.infer<typeof insertGroupFileSchema>;

export type GroupMessage = typeof groupMessages.$inferSelect;
export type InsertGroupMessage = z.infer<typeof insertGroupMessageSchema>;

// Exam system tables
export const skillExams = pgTable("skill_exams", {
  id: serial("id").primaryKey(),
  skillName: text("skill_name").notNull(),
  proficiencyLevel: text("proficiency_level").notNull(), // beginner, intermediate, advanced
  passingScore: integer("passing_score").notNull().default(70),
  timeLimit: integer("time_limit").notNull().default(30), // in minutes
  isActive: boolean("is_active").notNull().default(true),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const examQuestions = pgTable("exam_questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull(),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // multiple_choice, coding, true_false, short_answer
  options: text("options").array(), // For multiple choice questions
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficultyLevel: text("difficulty_level").notNull().default("medium"), // easy, medium, hard  
  points: integer("points").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userExamAttempts = pgTable("user_exam_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  examId: integer("exam_id").notNull(),
  skillId: integer("skill_id").notNull(),
  score: integer("score"),
  maxScore: integer("max_score").notNull(),
  passed: boolean("passed").notNull().default(false),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpentMinutes: integer("time_spent_minutes"),
  answers: jsonb("answers"), // Store user's answers
});

export const verificationRequests = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skillId: integer("skill_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  reviewedById: integer("reviewed_by_id"),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  examAttemptId: integer("exam_attempt_id"),
});

// Define insert schemas
export const insertSkillExamSchema = createInsertSchema(skillExams).pick({
  skillName: true,
  proficiencyLevel: true,
  passingScore: true,
  timeLimit: true,
  isActive: true,
  createdById: true,
});

export const insertExamQuestionSchema = createInsertSchema(examQuestions).pick({
  examId: true,
  questionText: true,
  questionType: true,
  options: true,
  correctAnswer: true,
  explanation: true, 
  difficultyLevel: true,
  points: true,
});

export const insertUserExamAttemptSchema = createInsertSchema(userExamAttempts).pick({
  userId: true,
  examId: true,
  skillId: true,
  score: true,
  maxScore: true,
  passed: true,
  timeSpentMinutes: true,
}).extend({
  answers: z.record(z.any()).optional(),
  completedAt: z.date().optional(),
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).pick({
  userId: true,
  skillId: true,
  status: true,
  reviewedById: true,
  reviewNotes: true,
  examAttemptId: true,
}).extend({
  reviewedAt: z.date().optional(),
});

// Define export types for exam tables
export type SkillExam = typeof skillExams.$inferSelect;
export type InsertSkillExam = z.infer<typeof insertSkillExamSchema>;

export type ExamQuestion = typeof examQuestions.$inferSelect;
export type InsertExamQuestion = z.infer<typeof insertExamQuestionSchema>;

export type UserExamAttempt = typeof userExamAttempts.$inferSelect;
export type InsertUserExamAttempt = z.infer<typeof insertUserExamAttemptSchema>;

export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
