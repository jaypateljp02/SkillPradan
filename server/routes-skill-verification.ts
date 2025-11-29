import { Express } from "express";
import { isAuthenticated } from "./token-auth";
import { IStorage } from "./storage";
import {
    generateSkillAssessment,
    gradeAssessment,
    SkillQuestion
} from "./ai-assessment";

export function registerSkillVerificationRoutes(app: Express, storage: IStorage) {

    // Generate a new skill assessment test
    app.post("/api/skills/:id/generate-assessment", isAuthenticated, async (req, res) => {
        const userId = req.user!.id;
        const skillId = parseInt(req.params.id);
        const { difficulty } = req.body;

        try {
            const skill = await storage.getSkill(skillId);
            if (!skill) {
                return res.status(404).json({ error: "Skill not found" });
            }

            if (skill.userId !== userId) {
                return res.status(403).json({ error: "You can only take assessments for your own skills" });
            }

            console.log(`Generating ${difficulty || 'intermediate'} assessment for ${skill.name}...`);

            const assessment = await generateSkillAssessment(
                skill.name,
                difficulty || "intermediate"
            );

            res.json(assessment);
        } catch (error) {
            console.error("Error generating assessment:", error);
            res.status(500).json({ error: "Failed to generate assessment" });
        }
    });

    // Submit and grade a completed assessment
    app.post("/api/skills/:id/submit-assessment", isAuthenticated, async (req, res) => {
        const userId = req.user!.id;
        const skillId = parseInt(req.params.id);
        const { questions, userAnswers, difficulty } = req.body;

        try {
            const skill = await storage.getSkill(skillId);
            if (!skill) {
                return res.status(404).json({ error: "Skill not found" });
            }

            if (skill.userId !== userId) {
                return res.status(403).json({ error: "You can only submit assessments for your own skills" });
            }

            console.log(`Grading assessment for ${skill.name}...`);

            // Grade the assessment using AI
            const result = await gradeAssessment(questions, userAnswers);

            // Save the assessment attempt
            const assessment = await storage.createSkillAssessment({
                userId,
                skillId,
                skillName: skill.name,
                difficulty: difficulty || "intermediate",
                questions,
                userAnswers,
                score: result.score,
                totalQuestions: result.totalQuestions,
                percentage: result.percentage,
                badgeAwarded: result.badgeLevel
            });

            // If a badge was earned, award it
            if (result.badgeLevel) {
                // Check if user already has this badge level for this skill
                const existingBadges = await storage.getSkillBadgesByUser(userId);
                const hasBadge = existingBadges.some(
                    b => b.skillId === skillId && b.badgeLevel === result.badgeLevel
                );

                if (!hasBadge) {
                    await storage.createSkillBadge({
                        userId,
                        skillId,
                        skillName: skill.name,
                        badgeLevel: result.badgeLevel,
                        score: result.score,
                        percentage: result.percentage
                    });

                    // Update skill verification status
                    await storage.updateSkill(skillId, {
                        isVerified: true,
                        proficiencyLevel: result.badgeLevel
                    });

                    // Award points based on badge level
                    const pointsMap = {
                        beginner: 50,
                        intermediate: 100,
                        advanced: 200,
                        expert: 500
                    };
                    const points = pointsMap[result.badgeLevel] || 50;

                    // Create activity
                    await storage.createActivity({
                        userId,
                        type: "verification",
                        description: `Earned ${result.badgeLevel} badge for ${skill.name}`,
                        pointsEarned: points
                    });
                }
            }

            res.json({
                assessment,
                result,
                badgeEarned: result.badgeLevel !== null
            });
        } catch (error) {
            console.error("Error submitting assessment:", error);
            res.status(500).json({ error: "Failed to grade assessment" });
        }
    });

    // Get all skill badges for a user
    app.get("/api/users/:id/skill-badges", isAuthenticated, async (req, res) => {
        const userId = parseInt(req.params.id);

        try {
            const badges = await storage.getSkillBadgesByUser(userId);
            res.json(badges);
        } catch (error) {
            console.error("Error fetching skill badges:", error);
            res.status(500).json({ error: "Failed to fetch skill badges" });
        }
    });

    // Get assessment history for a skill
    app.get("/api/skills/:id/assessments", isAuthenticated, async (req, res) => {
        const skillId = parseInt(req.params.id);
        const userId = req.user!.id;

        try {
            const skill = await storage.getSkill(skillId);
            if (!skill) {
                return res.status(404).json({ error: "Skill not found" });
            }

            if (skill.userId !== userId) {
                return res.status(403).json({ error: "Unauthorized" });
            }

            const assessments = await storage.getSkillAssessmentsBySkill(skillId);
            res.json(assessments);
        } catch (error) {
            console.error("Error fetching assessments:", error);
            res.status(500).json({ error: "Failed to fetch assessments" });
        }
    });
}
