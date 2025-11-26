import { IStorage } from "./storage";
import { supabase } from "./supabase.config";
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
    Group, GroupMember, GroupEvent, GroupFile, GroupMessage,
    Post, InsertPost,
    PostComment, InsertPostComment,
    PostLike, InsertPostLike,
    DirectMessage, InsertDirectMessage,
    Friend, InsertFriend
} from "@shared/schema";
import session from "express-session";
import type { Store as SessionStore } from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class SupabaseStorage implements IStorage {
    sessionStore: SessionStore;

    constructor() {
        this.sessionStore = new MemoryStore({
            checkPeriod: 86400000
        });
        console.log("✅ Supabase Storage initialized");
    }

    // User operations
    async getUser(id: number): Promise<User | undefined> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching user:', error);
            return undefined;
        }
        const item = data as any;
        return {
            id: item.id,
            username: item.username,
            password: item.password,
            name: item.name,
            email: item.email,
            university: item.university,
            avatar: item.avatar,
            points: item.points,
            level: item.level,
            isAdmin: item.is_admin,
            createdAt: new Date(item.created_at)
        };
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .ilike('username', username)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return undefined; // Not found
            console.error('Error fetching user by username:', error);
            return undefined;
        }
        const item = data as any;
        return {
            id: item.id,
            username: item.username,
            password: item.password,
            name: item.name,
            email: item.email,
            university: item.university,
            avatar: item.avatar,
            points: item.points,
            level: item.level,
            isAdmin: item.is_admin,
            createdAt: new Date(item.created_at)
        };
    }

    async createUser(user: InsertUser): Promise<User> {
        const { data, error } = await supabase
            .from('users')
            .insert({
                username: user.username,
                password: user.password,
                name: user.name,
                email: user.email,
                university: user.university || '',
                avatar: user.avatar || '',
                is_admin: user.isAdmin || false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
            throw new Error(`Failed to create user: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            username: item.username,
            password: item.password,
            name: item.name,
            email: item.email,
            university: item.university,
            avatar: item.avatar,
            points: item.points,
            level: item.level,
            isAdmin: item.is_admin,
            createdAt: new Date(item.created_at)
        };
    }

    async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
        const { data, error } = await supabase
            .from('users')
            .update(userData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating user:', error);
            return undefined;
        }
        const item = data as any;
        return {
            id: item.id,
            username: item.username,
            password: item.password,
            name: item.name,
            email: item.email,
            university: item.university,
            avatar: item.avatar,
            points: item.points,
            level: item.level,
            isAdmin: item.is_admin,
            createdAt: new Date(item.created_at)
        };
    }

    // Skill operations
    async getSkill(id: number): Promise<Skill | undefined> {
        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            name: item.name,
            isVerified: item.is_verified,
            proficiencyLevel: item.proficiency_level,
            isTeaching: item.is_teaching
        };
    }

    async getSkillsByUser(userId: number): Promise<Skill[]> {
        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching skills:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            name: item.name,
            isVerified: item.is_verified,
            proficiencyLevel: item.proficiency_level,
            isTeaching: item.is_teaching
        }));
    }

    async createSkill(skill: InsertSkill): Promise<Skill> {
        const { data, error } = await supabase
            .from('skills')
            .insert({
                name: skill.name,
                user_id: skill.userId,
                is_verified: skill.isVerified || false,
                proficiency_level: skill.proficiencyLevel || 'beginner',
                is_teaching: skill.isTeaching
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating skill:', error);
            throw new Error(`Failed to create skill: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            name: item.name,
            isVerified: item.is_verified,
            proficiencyLevel: item.proficiency_level,
            isTeaching: item.is_teaching
        };
    }

    async updateSkill(id: number, skillData: Partial<Skill>): Promise<Skill | undefined> {
        const { data, error } = await supabase
            .from('skills')
            .update(skillData)
            .eq('id', id)
            .select()
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            name: item.name,
            isVerified: item.is_verified,
            proficiencyLevel: item.proficiency_level,
            isTeaching: item.is_teaching
        };
    }

    async deleteSkill(id: number): Promise<boolean> {
        const { error } = await supabase
            .from('skills')
            .delete()
            .eq('id', id);

        return !error;
    }


    // Exchange operations
    async getExchange(id: number): Promise<Exchange | undefined> {
        const { data, error } = await supabase
            .from('exchanges')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            teacherId: item.teacher_id,
            studentId: item.student_id,
            teacherSkillId: item.teacher_skill_id,
            studentSkillId: item.student_skill_id,
            status: item.status,
            sessionsCompleted: item.sessions_completed,
            totalSessions: item.total_sessions
        };
    }

    async getExchangesByUser(userId: number): Promise<Exchange[]> {
        const { data, error } = await supabase
            .from('exchanges')
            .select('*')
            .or(`teacher_id.eq.${userId},student_id.eq.${userId}`);

        if (error) {
            console.error('Error fetching exchanges:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            teacherId: item.teacher_id,
            studentId: item.student_id,
            teacherSkillId: item.teacher_skill_id,
            studentSkillId: item.student_skill_id,
            status: item.status,
            sessionsCompleted: item.sessions_completed,
            totalSessions: item.total_sessions
        }));
    }

    async createExchange(exchange: InsertExchange): Promise<Exchange> {
        const { data, error } = await supabase
            .from('exchanges')
            .insert({
                teacher_id: exchange.teacherId,
                student_id: exchange.studentId,
                teacher_skill_id: exchange.teacherSkillId,
                student_skill_id: exchange.studentSkillId,
                status: exchange.status || 'pending',
                sessions_completed: exchange.sessionsCompleted || 0,
                total_sessions: exchange.totalSessions || 3
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating exchange:', error);
            throw new Error(`Failed to create exchange: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            teacherId: item.teacher_id,
            studentId: item.student_id,
            teacherSkillId: item.teacher_skill_id,
            studentSkillId: item.student_skill_id,
            status: item.status,
            sessionsCompleted: item.sessions_completed,
            totalSessions: item.total_sessions
        };
    }

    async updateExchange(id: number, exchangeData: Partial<Exchange>): Promise<Exchange | undefined> {
        const { data, error } = await supabase
            .from('exchanges')
            .update(exchangeData)
            .eq('id', id)
            .select()
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            teacherId: item.teacher_id,
            studentId: item.student_id,
            teacherSkillId: item.teacher_skill_id,
            studentSkillId: item.student_skill_id,
            status: item.status,
            sessionsCompleted: item.sessions_completed,
            totalSessions: item.total_sessions
        };
    }

    // Session operations
    async getSession(id: number): Promise<Session | undefined> {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            exchangeId: item.exchange_id,
            scheduledTime: new Date(item.scheduled_time),
            duration: item.duration,
            status: item.status,
            notes: item.notes,
            whiteboardData: item.whiteboard_data
        };
    }

    async getSessionsByExchange(exchangeId: number): Promise<Session[]> {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('exchange_id', exchangeId);

        if (error) {
            console.error('Error fetching sessions:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            exchangeId: item.exchange_id,
            scheduledTime: new Date(item.scheduled_time),
            duration: item.duration,
            status: item.status,
            notes: item.notes,
            whiteboardData: item.whiteboard_data
        }));
    }

    async createSession(sessionData: InsertSession): Promise<Session> {
        const { data, error } = await supabase
            .from('sessions')
            .insert({
                exchange_id: sessionData.exchangeId,
                scheduled_time: sessionData.scheduledTime,
                duration: sessionData.duration || 60,
                status: sessionData.status || 'scheduled',
                notes: '',
                whiteboard_data: {}
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating session:', error);
            throw new Error(`Failed to create session: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            exchangeId: item.exchange_id,
            scheduledTime: new Date(item.scheduled_time),
            duration: item.duration,
            status: item.status,
            notes: item.notes,
            whiteboardData: item.whiteboard_data
        };
    }

    async updateSession(id: number, sessionData: Partial<Session>): Promise<Session | undefined> {
        const { data, error } = await supabase
            .from('sessions')
            .update(sessionData)
            .eq('id', id)
            .select()
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            exchangeId: item.exchange_id,
            scheduledTime: new Date(item.scheduled_time),
            duration: item.duration,
            status: item.status,
            notes: item.notes,
            whiteboardData: item.whiteboard_data
        };
    }

    // Activity operations
    async getActivity(id: number): Promise<Activity | undefined> {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            type: item.type,
            description: item.description,
            pointsEarned: item.points_earned,
            createdAt: new Date(item.created_at)
        };
    }

    async getActivitiesByUser(userId: number): Promise<Activity[]> {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching activities:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            type: item.type,
            description: item.description,
            pointsEarned: item.points_earned,
            createdAt: new Date(item.created_at)
        }));
    }

    async createActivity(activity: InsertActivity): Promise<Activity> {
        const { data, error } = await supabase
            .from('activities')
            .insert({
                user_id: activity.userId,
                type: activity.type,
                description: activity.description,
                points_earned: activity.pointsEarned || 0
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating activity:', error);
            throw new Error(`Failed to create activity: ${error.message}`);
        }

        // Update user points
        if (activity.pointsEarned) {
            const user = await this.getUser(activity.userId);
            if (user) {
                const updatedPoints = user.points + activity.pointsEarned;
                const updatedLevel = Math.floor(updatedPoints / 500) + 1;
                await this.updateUser(user.id, {
                    points: updatedPoints,
                    level: updatedLevel
                });
            }
        }

        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            type: item.type,
            description: item.description,
            pointsEarned: item.points_earned,
            createdAt: new Date(item.created_at)
        };
    }

    // Badge operations
    async getBadge(id: number): Promise<Badge | undefined> {
        const { data, error } = await supabase
            .from('badges')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            icon: item.icon,
            pointsAwarded: item.points_awarded
        };
    }

    async getAllBadges(): Promise<Badge[]> {
        const { data, error } = await supabase
            .from('badges')
            .select('*');

        if (error) {
            console.error('Error fetching badges:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            icon: item.icon,
            pointsAwarded: item.points_awarded
        }));
    }

    async createBadge(badge: InsertBadge): Promise<Badge> {
        const { data, error } = await supabase
            .from('badges')
            .insert({
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                points_awarded: badge.pointsAwarded || 0
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating badge:', error);
            throw new Error(`Failed to create badge: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            icon: item.icon,
            pointsAwarded: item.points_awarded
        };
    }

    // UserBadge operations
    async getUserBadges(userId: number): Promise<UserBadge[]> {
        const { data, error } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching user badges:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            badgeId: item.badge_id,
            awardedAt: new Date(item.awarded_at)
        }));
    }

    async createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge> {
        const { data, error } = await supabase
            .from('user_badges')
            .insert({
                user_id: userBadge.userId,
                badge_id: userBadge.badgeId
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating user badge:', error);
            throw new Error(`Failed to create user badge: ${error.message}`);
        }

        // Create activity for earning badge
        const badge = await this.getBadge(userBadge.badgeId);
        if (badge) {
            await this.createActivity({
                userId: userBadge.userId,
                type: 'badge',
                description: `Earned the ${badge.name} badge`,
                pointsEarned: badge.pointsAwarded
            });
        }

        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            badgeId: item.badge_id,
            awardedAt: new Date(item.awarded_at)
        };
    }

    // Challenge operations
    async getChallenge(id: number): Promise<Challenge | undefined> {
        const { data, error } = await supabase
            .from('challenges')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            title: item.title,
            description: item.description,
            targetCount: item.target_count,
            type: item.type,
            pointsRewarded: item.points_rewarded,
            durationDays: item.duration_days
        };
    }

    async getAllChallenges(): Promise<Challenge[]> {
        const { data, error } = await supabase
            .from('challenges')
            .select('*');

        if (error) {
            console.error('Error fetching challenges:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            targetCount: item.target_count,
            type: item.type,
            pointsRewarded: item.points_rewarded,
            durationDays: item.duration_days
        }));
    }

    async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
        const { data, error } = await supabase
            .from('challenges')
            .insert({
                title: challenge.title,
                description: challenge.description,
                target_count: challenge.targetCount,
                type: challenge.type,
                points_rewarded: challenge.pointsRewarded,
                duration_days: challenge.durationDays || 7
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating challenge:', error);
            throw new Error(`Failed to create challenge: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            title: item.title,
            description: item.description,
            targetCount: item.target_count,
            type: item.type,
            pointsRewarded: item.points_rewarded,
            durationDays: item.duration_days
        };
    }

    // UserChallenge operations
    async getUserChallenges(userId: number): Promise<UserChallenge[]> {
        const { data, error } = await supabase
            .from('user_challenges')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching user challenges:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            challengeId: item.challenge_id,
            currentCount: item.current_count,
            completed: item.completed,
            completedAt: item.completed_at ? new Date(item.completed_at) : undefined
        }));
    }

    async createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge> {
        const { data, error } = await supabase
            .from('user_challenges')
            .insert({
                user_id: userChallenge.userId,
                challenge_id: userChallenge.challengeId,
                current_count: 0
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating user challenge:', error);
            throw new Error(`Failed to create user challenge: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            challengeId: item.challenge_id,
            currentCount: item.current_count,
            completed: item.completed,
            completedAt: item.completed_at ? new Date(item.completed_at) : undefined
        };
    }

    async updateUserChallenge(id: number, data: Partial<UserChallenge>): Promise<UserChallenge | undefined> {
        const { data: updated, error } = await supabase
            .from('user_challenges')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) return undefined;
        const item = updated as any;
        return {
            id: item.id,
            userId: item.user_id,
            challengeId: item.challenge_id,
            currentCount: item.current_count,
            completed: item.completed,
            completedAt: item.completed_at ? new Date(item.completed_at) : undefined
        };
    }

    // Review operations
    async getReview(id: number): Promise<Review | undefined> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            exchangeId: item.exchange_id,
            reviewerId: item.reviewer_id,
            reviewedUserId: item.reviewed_user_id,
            rating: item.rating,
            comment: item.comment,
            createdAt: new Date(item.created_at)
        };
    }

    async getReviewsByUser(userId: number): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('reviewed_user_id', userId);

        if (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            exchangeId: item.exchange_id,
            reviewerId: item.reviewer_id,
            reviewedUserId: item.reviewed_user_id,
            rating: item.rating,
            comment: item.comment,
            createdAt: new Date(item.created_at)
        }));
    }

    async createReview(review: InsertReview): Promise<Review> {
        const { data, error } = await supabase
            .from('reviews')
            .insert({
                exchange_id: review.exchangeId,
                reviewer_id: review.reviewerId,
                reviewed_user_id: review.reviewedUserId,
                rating: review.rating,
                comment: review.comment
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating review:', error);
            throw new Error(`Failed to create review: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            exchangeId: item.exchange_id,
            reviewerId: item.reviewer_id,
            reviewedUserId: item.reviewed_user_id,
            rating: item.rating,
            comment: item.comment,
            createdAt: new Date(item.created_at)
        };
    }

    async getUserRating(userId: number): Promise<{ rating: number, count: number }> {
        const reviews = await this.getReviewsByUser(userId);
        if (reviews.length === 0) {
            return { rating: 0, count: 0 };
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return {
            rating: totalRating / reviews.length,
            count: reviews.length
        };
    }

    // Group operations
    async getGroup(id: number): Promise<Group | undefined> {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            isPrivate: item.is_private,
            isTeamProject: item.is_team_project,
            createdById: item.created_by_id,
            createdAt: new Date(item.created_at)
        };
    }

    async getAllGroups(): Promise<Group[]> {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching groups:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            isPrivate: item.is_private,
            isTeamProject: item.is_team_project,
            createdById: item.created_by_id,
            createdAt: new Date(item.created_at)
        }));
    }

    async getGroupsByUser(userId: number): Promise<Group[]> {
        const { data: memberData, error: memberError } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', userId);

        if (memberError || !memberData) {
            console.error('Error fetching user groups:', memberError);
            return [];
        }

        const groupIds = memberData.map(m => m.group_id);
        if (groupIds.length === 0) return [];

        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .in('id', groupIds);

        if (error) {
            console.error('Error fetching groups:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            isPrivate: item.is_private,
            isTeamProject: item.is_team_project,
            createdById: item.created_by_id,
            createdAt: new Date(item.created_at)
        }));
    }

    async createGroup(groupData: Partial<Group>): Promise<Group> {
        const { data, error } = await supabase
            .from('groups')
            .insert({
                name: groupData.name!,
                description: groupData.description,
                is_private: groupData.isPrivate || false,
                is_team_project: groupData.isTeamProject || false,
                created_by_id: groupData.createdById!
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating group:', error);
            throw new Error(`Failed to create group: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            isPrivate: item.is_private,
            isTeamProject: item.is_team_project,
            createdById: item.created_by_id,
            createdAt: new Date(item.created_at)
        };
    }

    async updateGroup(id: number, groupData: Partial<Group>): Promise<Group | undefined> {
        const { data, error } = await supabase
            .from('groups')
            .update(groupData)
            .eq('id', id)
            .select()
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            isPrivate: item.is_private,
            isTeamProject: item.is_team_project,
            createdById: item.created_by_id,
            createdAt: new Date(item.created_at)
        };
    }

    async deleteGroup(id: number): Promise<boolean> {
        const { error } = await supabase
            .from('groups')
            .delete()
            .eq('id', id);

        return !error;
    }

    // Group member operations
    async getGroupMember(id: number): Promise<GroupMember | undefined> {
        const { data, error } = await supabase
            .from('group_members')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            groupId: item.group_id,
            userId: item.user_id,
            role: item.role,
            joinedAt: new Date(item.joined_at)
        };
    }

    async getGroupMembers(groupId: number): Promise<GroupMember[]> {
        const { data, error } = await supabase
            .from('group_members')
            .select('*')
            .eq('group_id', groupId);

        if (error) {
            console.error('Error fetching group members:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            groupId: item.group_id,
            userId: item.user_id,
            role: item.role,
            joinedAt: new Date(item.joined_at)
        }));
    }

    async addGroupMember(memberData: { groupId: number, userId: number, role: string }): Promise<GroupMember> {
        const { data, error } = await supabase
            .from('group_members')
            .insert({
                group_id: memberData.groupId,
                user_id: memberData.userId,
                role: memberData.role
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding group member:', error);
            throw new Error(`Failed to add group member: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            groupId: item.group_id,
            userId: item.user_id,
            role: item.role,
            joinedAt: new Date(item.joined_at)
        };
    }

    async removeGroupMember(groupId: number, userId: number): Promise<boolean> {
        const { error } = await supabase
            .from('group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', userId);

        return !error;
    }

    // Group file operations
    async getGroupFile(id: number): Promise<GroupFile | undefined> {
        const { data, error } = await supabase
            .from('group_files')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            groupId: item.group_id,
            name: item.name,
            type: item.type,
            url: item.url,
            uploadedById: item.uploaded_by_id,
            uploadedAt: new Date(item.uploaded_at)
        };
    }

    async getGroupFiles(groupId: number): Promise<GroupFile[]> {
        const { data, error } = await supabase
            .from('group_files')
            .select('*')
            .eq('group_id', groupId)
            .order('uploaded_at', { ascending: false });

        if (error) {
            console.error('Error fetching group files:', error);
            return [];
        }
        return data as GroupFile[];
    }

    async addGroupFile(fileData: { groupId: number, uploadedById: number, name: string, type: string, url: string }): Promise<GroupFile> {
        const { data, error } = await supabase
            .from('group_files')
            .insert({
                group_id: fileData.groupId,
                uploaded_by_id: fileData.uploadedById,
                name: fileData.name,
                type: fileData.type,
                url: fileData.url
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding group file:', error);
            throw new Error(`Failed to add group file: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            groupId: item.group_id,
            name: item.name,
            type: item.type,
            url: item.url,
            uploadedById: item.uploaded_by_id,
            uploadedAt: new Date(item.uploaded_at)
        };
    }

    // Group event operations
    async getGroupEvent(id: number): Promise<GroupEvent | undefined> {
        const { data, error } = await supabase
            .from('group_events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            groupId: item.group_id,
            title: item.title,
            description: item.description,
            startTime: new Date(item.start_time),
            endTime: item.end_time ? new Date(item.end_time) : undefined,
            createdById: item.created_by_id
        };
    }

    async getGroupEvents(groupId: number): Promise<GroupEvent[]> {
        const { data, error } = await supabase
            .from('group_events')
            .select('*')
            .eq('group_id', groupId)
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Error fetching group events:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            groupId: item.group_id,
            title: item.title,
            description: item.description,
            startTime: new Date(item.start_time),
            endTime: item.end_time ? new Date(item.end_time) : undefined,
            createdById: item.created_by_id
        }));
    }

    async createGroupEvent(eventData: { groupId: number, createdById: number, title: string, description?: string, startTime: Date, endTime?: Date }): Promise<GroupEvent> {
        const { data, error } = await supabase
            .from('group_events')
            .insert({
                group_id: eventData.groupId,
                created_by_id: eventData.createdById,
                title: eventData.title,
                description: eventData.description,
                start_time: eventData.startTime,
                end_time: eventData.endTime
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating group event:', error);
            throw new Error(`Failed to create group event: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            groupId: item.group_id,
            title: item.title,
            description: item.description,
            startTime: new Date(item.start_time),
            endTime: item.end_time ? new Date(item.end_time) : undefined,
            createdById: item.created_by_id
        };
    }

    // Group message operations
    async getGroupMessages(groupId: number): Promise<GroupMessage[]> {
        const { data, error } = await supabase
            .from('group_messages')
            .select('*')
            .eq('group_id', groupId)
            .order('sent_at', { ascending: true });

        if (error) {
            console.error('Error fetching group messages:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            groupId: item.group_id,
            userId: item.user_id,
            content: item.content,
            sentAt: new Date(item.sent_at)
        }));
    }

    async createGroupMessage(messageData: { groupId: number, userId: number, content: string }): Promise<GroupMessage> {
        const { data, error } = await supabase
            .from('group_messages')
            .insert({
                group_id: messageData.groupId,
                user_id: messageData.userId,
                content: messageData.content
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating group message:', error);
            throw new Error(`Failed to create group message: ${error.message}`);
        }
        const item = data as any;
        return {
            id: item.id,
            groupId: item.group_id,
            userId: item.user_id,
            content: item.content,
            sentAt: new Date(item.sent_at)
        };
    }

    // Direct message operations
    async getDirectMessages(userId1: number, userId2: number): Promise<any[]> {
        const { data, error } = await supabase
            .from('direct_messages')
            .select('*')
            .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
            .order('sent_at', { ascending: true });

        if (error) {
            console.error('Error fetching direct messages:', error);
            return [];
        }

        // Enrich with user data
        const enriched = await Promise.all(
            data.map(async (msg) => {
                const sender = await this.getUser(msg.sender_id);
                const receiver = await this.getUser(msg.receiver_id);
                return {
                    id: msg.id,
                    senderId: msg.sender_id,
                    receiverId: msg.receiver_id,
                    content: msg.content,
                    isRead: msg.is_read,
                    sentAt: new Date(msg.sent_at),
                    sender: sender ? { id: sender.id, name: sender.name, avatar: sender.avatar, username: sender.username } : null,
                    receiver: receiver ? { id: receiver.id, name: receiver.name, avatar: receiver.avatar, username: receiver.username } : null
                };
            })
        );

        return enriched;
    }

    async getConversations(userId: number): Promise<any[]> {
        const { data, error } = await supabase
            .from('direct_messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('sent_at', { ascending: false });

        if (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }

        // Group by conversation partner
        const conversationsMap = new Map<number, any>();

        for (const message of data) {
            const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;

            const existing = conversationsMap.get(partnerId);
            if (!existing || new Date(message.sent_at) > new Date(existing.lastMessage.sent_at)) {
                conversationsMap.set(partnerId, {
                    partnerId,
                    lastMessage: message
                });
            }
        }

        // Enrich with partner data and unread count
        const conversations = await Promise.all(
            Array.from(conversationsMap.values()).map(async (conv) => {
                const partner = await this.getUser(conv.partnerId);

                const { data: unreadData } = await supabase
                    .from('direct_messages')
                    .select('id')
                    .eq('sender_id', conv.partnerId)
                    .eq('receiver_id', userId)
                    .eq('is_read', false);

                const unreadCount = unreadData?.length || 0;

                return {
                    partner: partner ? {
                        id: partner.id,
                        name: partner.name,
                        avatar: partner.avatar,
                        username: partner.username
                    } : null,
                    lastMessage: {
                        content: conv.lastMessage.content,
                        sentAt: new Date(conv.lastMessage.sent_at)
                    },
                    unreadCount
                };
            })
        );

        // Sort by most recent message
        return conversations.sort((a, b) =>
            new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime()
        );
    }

    async createDirectMessage(messageData: { senderId: number, receiverId: number, content: string }): Promise<any> {
        const { data, error } = await supabase
            .from('direct_messages')
            .insert({
                sender_id: messageData.senderId,
                receiver_id: messageData.receiverId,
                content: messageData.content,
                is_read: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating direct message:', error);
            throw new Error(`Failed to create direct message: ${error.message}`);
        }

        // Enrich with sender and receiver data
        const sender = await this.getUser(messageData.senderId);
        const receiver = await this.getUser(messageData.receiverId);

        return {
            id: data.id,
            senderId: data.sender_id,
            receiverId: data.receiver_id,
            content: data.content,
            isRead: data.is_read,
            sentAt: new Date(data.sent_at),
            sender: sender ? { id: sender.id, name: sender.name, avatar: sender.avatar, username: sender.username } : null,
            receiver: receiver ? { id: receiver.id, name: receiver.name, avatar: receiver.avatar, username: receiver.username } : null
        };
    }

    async markMessageAsRead(messageId: number): Promise<any> {
        const { data, error } = await supabase
            .from('direct_messages')
            .update({ is_read: true })
            .eq('id', messageId)
            .select()
            .single();

        if (error) return null;
        if (error) return null;
        const item = data as any;
        return {
            id: item.id,
            senderId: item.sender_id,
            receiverId: item.receiver_id,
            content: item.content,
            isRead: item.is_read,
            sentAt: new Date(item.sent_at)
        };
    }

    // Friend operations
    async getFriends(userId: number): Promise<Friend[]> {
        const { data, error } = await supabase
            .from('friends')
            .select('*')
            .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
            .eq('status', 'accepted');

        if (error) {
            console.error('Error fetching friends:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            friendId: item.friend_id,
            status: item.status,
            createdAt: new Date(item.created_at)
        }));
    }

    async getFriendRequests(userId: number): Promise<Friend[]> {
        console.log('🔍 Fetching friend requests for user:', userId);
        const { data, error } = await supabase
            .from('friends')
            .select('*')
            .eq('friend_id', userId)
            .eq('status', 'pending');

        if (error) {
            console.error('❌ Error fetching friend requests:', error);
            return [];
        }
        console.log('✅ Found friend requests:', data);
        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            friendId: item.friend_id,
            status: item.status,
            createdAt: new Date(item.created_at)
        }));
    }

    async getSentFriendRequests(userId: number): Promise<Friend[]> {
        console.log('🔍 Fetching sent friend requests for user:', userId);
        const { data, error } = await supabase
            .from('friends')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'pending');

        if (error) {
            console.error('❌ Error fetching sent friend requests:', error);
            return [];
        }
        console.log('✅ Found sent friend requests:', data);
        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            friendId: item.friend_id,
            status: item.status,
            createdAt: new Date(item.created_at)
        }));
    }

    async sendFriendRequest(userId: number, friendId: number): Promise<Friend> {
        console.log('📤 Sending friend request from', userId, 'to', friendId);
        const { data, error } = await supabase
            .from('friends')
            .insert({
                user_id: userId,
                friend_id: friendId,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error sending friend request:', error);
            throw new Error(`Failed to send friend request: ${error.message}`);
        }
        console.log('✅ Friend request sent successfully:', data);
        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            friendId: item.friend_id,
            status: item.status,
            createdAt: new Date(item.created_at)
        };
    }

    async respondToFriendRequest(requestId: number, status: "accepted" | "rejected"): Promise<Friend | undefined> {
        console.log('📝 Responding to friend request:', requestId, 'with status:', status);
        const { data, error } = await supabase
            .from('friends')
            .update({ status })
            .eq('id', requestId)
            .select()
            .single();

        if (error) {
            console.error('❌ Error responding to friend request:', error);
            return undefined;
        }
        console.log('✅ Friend request response saved:', data);
        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            friendId: item.friend_id,
            status: item.status,
            createdAt: new Date(item.created_at)
        };
    }

    async checkFriendStatus(userId: number, friendId: number): Promise<Friend | undefined> {
        const { data, error } = await supabase
            .from('friends')
            .select('*')
            .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return undefined; // Not found
            console.error('Error checking friend status:', error);
            return undefined;
        }
        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            friendId: item.friend_id,
            status: item.status,
            createdAt: new Date(item.created_at)
        };
    }

    // Post operations
    async getPost(id: number): Promise<Post | undefined> {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            type: item.type,
            title: item.title,
            subject: item.subject,
            content: item.content,
            imageUrl: item.image_url,
            likes: item.likes,
            createdAt: new Date(item.created_at)
        };
    }

    async getAllPosts(filters?: { type?: string, subject?: string }): Promise<Post[]> {
        let query = supabase.from('posts').select('*');

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        if (filters?.subject) {
            query = query.ilike('subject', `%${filters.subject}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            type: item.type,
            title: item.title,
            subject: item.subject,
            content: item.content,
            imageUrl: item.image_url,
            likes: item.likes,
            createdAt: new Date(item.created_at)
        }));
    }

    async getPostsByUser(userId: number): Promise<Post[]> {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user posts:', error);
            return [];
        }
        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            type: item.type,
            title: item.title,
            subject: item.subject,
            content: item.content,
            imageUrl: item.image_url,
            likes: item.likes,
            createdAt: new Date(item.created_at)
        }));
    }

    async createPost(postData: InsertPost): Promise<Post> {
        const { data, error } = await supabase
            .from('posts')
            .insert({
                user_id: postData.userId,
                type: postData.type,
                title: postData.title,
                subject: postData.subject || null,
                content: postData.content,
                image_url: postData.imageUrl || null,
                likes: 0
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating post:', error);
            throw new Error(`Failed to create post: ${error.message}`);
        }

        // Create activity
        await this.createActivity({
            userId: postData.userId,
            type: 'post',
            description: `Created a ${postData.type} post: ${postData.title}`,
            pointsEarned: 5
        });

        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            type: item.type,
            title: item.title,
            subject: item.subject,
            content: item.content,
            imageUrl: item.image_url,
            likes: item.likes,
            createdAt: new Date(item.created_at)
        };
    }

    async updatePost(id: number, postData: Partial<Post>): Promise<Post | undefined> {
        const { data, error } = await supabase
            .from('posts')
            .update(postData)
            .eq('id', id)
            .select()
            .single();

        if (error) return undefined;
        const item = data as any;
        return {
            id: item.id,
            userId: item.user_id,
            type: item.type,
            title: item.title,
            subject: item.subject,
            content: item.content,
            imageUrl: item.image_url,
            likes: item.likes,
            createdAt: new Date(item.created_at)
        };
    }

    async deletePost(id: number): Promise<boolean> {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        return !error;
    }

    // Post comment operations
    async getPostComments(postId: number): Promise<any[]> {
        const { data, error } = await supabase
            .from('post_comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching post comments:', error);
            return [];
        }

        // Enrich with user data
        const enriched = await Promise.all(
            data.map(async (comment) => {
                const user = await this.getUser(comment.user_id);
                const item = comment as any;
                return {
                    id: item.id,
                    postId: item.post_id,
                    userId: item.user_id,
                    content: item.content,
                    createdAt: new Date(item.created_at),
                    user: user ? {
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar
                    } : null
                };
            })
        );

        return enriched;
    }

    async createPostComment(commentData: { postId: number, userId: number, content: string }): Promise<any> {
        const { data, error } = await supabase
            .from('post_comments')
            .insert({
                post_id: commentData.postId,
                user_id: commentData.userId,
                content: commentData.content
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating post comment:', error);
            throw new Error(`Failed to create post comment: ${error.message}`);
        }

        // Get user data for the response
        const user = await this.getUser(commentData.userId);
        const item = data as any;
        return {
            id: item.id,
            postId: item.post_id,
            userId: item.user_id,
            content: item.content,
            createdAt: new Date(item.created_at),
            user: user ? {
                id: user.id,
                name: user.name,
                avatar: user.avatar
            } : null
        };
    }

    async deletePostComment(id: number): Promise<boolean> {
        const { error } = await supabase
            .from('post_comments')
            .delete()
            .eq('id', id);

        return !error;
    }

    // Post like operations
    async likePost(postId: number, userId: number): Promise<boolean> {
        // Check if user already liked this post
        const { data: existingLike } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single();

        if (existingLike) {
            return false; // Already liked
        }

        const { error } = await supabase
            .from('post_likes')
            .insert({
                post_id: postId,
                user_id: userId
            });

        if (error) {
            console.error('Error liking post:', error);
            return false;
        }

        // Update post likes count
        const post = await this.getPost(postId);
        if (post) {
            await this.updatePost(postId, { likes: post.likes + 1 });
        }

        return true;
    }

    async unlikePost(postId: number, userId: number): Promise<boolean> {
        const { error } = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error unliking post:', error);
            return false;
        }

        // Update post likes count
        const post = await this.getPost(postId);
        if (post && post.likes > 0) {
            await this.updatePost(postId, { likes: post.likes - 1 });
        }

        return true;
    }

    async hasUserLikedPost(postId: number, userId: number): Promise<boolean> {
        const { data, error } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single();

        return !!data && !error;
    }

    async getPostLikeCount(postId: number): Promise<number> {
        const { count, error } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

        if (error) {
            console.error('Error getting post like count:', error);
            return 0;
        }
        return count || 0;
    }

    // Leaderboard
    async getLeaderboard(): Promise<{ id: number, name: string, university: string, exchanges: number, points: number, avatar: string }[]> {
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .order('points', { ascending: false });

        if (usersError || !users) {
            console.error('Error fetching leaderboard:', usersError);
            return [];
        }

        // Count exchanges for each user
        const leaderboard = await Promise.all(
            users.map(async (user) => {
                const { count } = await supabase
                    .from('exchanges')
                    .select('*', { count: 'exact', head: true })
                    .or(`teacher_id.eq.${user.id},student_id.eq.${user.id}`)
                    .eq('status', 'completed');

                return {
                    id: user.id,
                    name: user.name,
                    university: user.university || '',
                    exchanges: count || 0,
                    points: user.points || 0,
                    avatar: user.avatar || ''
                };
            })
        );

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
        teachingSkill: { id: number, name: string },
        learningSkill: { id: number, name: string },
        matchPercentage: number
    }[]> {
        const myTeachingSkill = await this.getSkill(teachingSkillId);
        const myLearningSkill = await this.getSkill(learningSkillId);

        if (!myTeachingSkill || !myLearningSkill) {
            return [];
        }

        const myUserId = myTeachingSkill.userId;

        // Find users who teach what I want to learn
        const { data: potentialTeachingSkills, error: error1 } = await supabase
            .from('skills')
            .select('*')
            .eq('name', myLearningSkill.name)
            .eq('is_teaching', true)
            .neq('user_id', myUserId);

        if (error1 || !potentialTeachingSkills) {
            console.error('Error finding skill matches:', error1);
            return [];
        }

        const matches: any[] = [];

        for (const theirTeachingSkill of potentialTeachingSkills) {
            const theirUserId = theirTeachingSkill.user_id;

            // Find if they want to learn what I teach
            const { data: theirLearningSkills, error: error2 } = await supabase
                .from('skills')
                .select('*')
                .eq('user_id', theirUserId)
                .eq('name', myTeachingSkill.name)
                .eq('is_teaching', false);

            if (error2 || !theirLearningSkills || theirLearningSkills.length === 0) {
                continue;
            }

            const matchingLearningSkill = theirLearningSkills[0];
            const otherUser = await this.getUser(theirUserId);

            if (otherUser) {
                const matchPercentage = 70 + (otherUser.id * 7) % 25;
                const { rating } = await this.getUserRating(otherUser.id);

                matches.push({
                    userId: otherUser.id,
                    username: otherUser.username,
                    name: otherUser.name,
                    avatar: otherUser.avatar || '',
                    university: otherUser.university || '',
                    rating: rating,
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

        return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }
}
