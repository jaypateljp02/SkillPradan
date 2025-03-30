import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  university: text("university"),
  avatar: text("avatar"),
  points: integer("points").default(0),
  level: integer("level").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  isVerified: boolean("is_verified").default(false),
  proficiencyLevel: text("proficiency_level").default("beginner"),
  isTeaching: boolean("is_teaching").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exchanges = pgTable("exchanges", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  studentId: integer("student_id").notNull(),
  teacherSkillId: integer("teacher_skill_id").notNull(),
  studentSkillId: integer("student_skill_id").notNull(),
  status: text("status").default("pending"), // pending, active, completed, cancelled
  sessionsCompleted: integer("sessions_completed").default(0),
  totalSessions: integer("total_sessions").default(3),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  exchangeId: integer("exchange_id").notNull(),
  scheduledTime: timestamp("scheduled_time"),
  duration: integer("duration").default(60), // in minutes
  status: text("status").default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  whiteboardData: json("whiteboard_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // exchange, badge, verification, quiz
  description: text("description").notNull(),
  pointsEarned: integer("points_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  pointsAwarded: integer("points_awarded").default(0),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetCount: integer("target_count").notNull(),
  type: text("type").notNull(), // exchange, verification
  pointsRewarded: integer("points_rewarded").notNull(),
  durationDays: integer("duration_days").default(7),
});

export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  currentCount: integer("current_count").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  exchangeId: integer("exchange_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  reviewedUserId: integer("reviewed_user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define zod schemas for inserts
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  university: true,
  avatar: true,
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
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  exchangeId: true,
  scheduledTime: true,
  duration: true,
  status: true,
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
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  createdById: integer("created_by_id").notNull(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").default("member"), // member, admin, moderator
  joinedAt: timestamp("joined_at").defaultNow(),
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
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const groupMessages = pgTable("group_messages", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type GroupEvent = typeof groupEvents.$inferSelect;
export type GroupFile = typeof groupFiles.$inferSelect;
export type GroupMessage = typeof groupMessages.$inferSelect;
