import { Express, Request, Response } from "express";
import { isAuthenticated } from "../token-auth";
import { storage } from "../storage";
import { isAdmin } from "../middleware/admin";
import { z } from "zod";
import { 
  insertSkillExamSchema, 
  insertExamQuestionSchema, 
  insertUserExamAttemptSchema,
  insertVerificationRequestSchema
} from "../../shared/schema";

/**
 * Register all skill verification and exam routes
 */
export function registerExamRoutes(app: Express) {
  // ===================== Admin Routes =====================

  // Get all exams (admin only)
  app.get("/api/admin/exams", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const exams = await storage.getAllSkillExams();
      res.json(exams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a new exam (admin only)
  app.post("/api/admin/exams", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSkillExamSchema.parse({
        ...req.body,
        createdById: req.user!.id,
      });
      
      const exam = await storage.createSkillExam(validatedData);
      res.status(201).json(exam);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  // Update an exam (admin only)
  app.patch("/api/admin/exams/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.id);
      if (isNaN(examId)) {
        return res.status(400).json({ message: "Invalid exam ID" });
      }
      
      const exam = await storage.getSkillExam(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      const updatedExam = await storage.updateSkillExam(examId, req.body);
      res.json(updatedExam);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add a question to an exam (admin only)
  app.post("/api/admin/exams/:examId/questions", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      if (isNaN(examId)) {
        return res.status(400).json({ message: "Invalid exam ID" });
      }
      
      const exam = await storage.getSkillExam(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      const validatedData = insertExamQuestionSchema.parse({
        ...req.body,
        examId
      });
      
      const question = await storage.createExamQuestion(validatedData);
      res.status(201).json(question);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  // Get exam statistics for admin dashboard
  app.get("/api/admin/exams/stats", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const verifiedSkillsStats = await storage.getVerifiedSkillsStats();
      const verificationRequestsStats = await storage.getVerificationRequestsStats();
      const examAttemptsStats = await storage.getExamAttemptStats();
      
      res.json({
        verifiedSkills: verifiedSkillsStats,
        verificationRequests: verificationRequestsStats,
        examAttempts: examAttemptsStats
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all pending verification requests (admin only)
  app.get("/api/admin/verification-requests", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const requests = await storage.getPendingVerificationRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update verification request status (admin only)
  app.patch("/api/admin/verification-requests/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const { status, reviewNotes } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }
      
      const request = await storage.getVerificationRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Verification request not found" });
      }
      
      // Update the verification request
      const updatedRequest = await storage.updateVerificationRequest(requestId, {
        status,
        reviewNotes,
        reviewedById: req.user!.id,
        reviewedAt: new Date()
      });
      
      // If approved, also update the skill
      if (status === "approved") {
        await storage.updateSkill(request.skillId, {
          isVerified: true
        });
        
        // Create activity for user
        await storage.createActivity({
          userId: request.userId,
          type: "verification",
          description: `Skill verified: ${(await storage.getSkill(request.skillId))?.name}`,
          pointsEarned: 50 // Award points for verification
        });
        
        // Update user points
        const user = await storage.getUser(request.userId);
        if (user) {
          await storage.updateUser(user.id, {
            points: user.points + 50
          });
        }
      }
      
      res.json(updatedRequest);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===================== User Routes =====================

  // Get available exams for a skill
  app.get("/api/skills/:skillName/exams", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { skillName } = req.params;
      const { level } = req.query;
      
      if (!level || typeof level !== 'string') {
        return res.status(400).json({ message: "Proficiency level is required" });
      }
      
      const exam = await storage.getSkillExamByNameAndLevel(skillName, level);
      if (!exam) {
        return res.status(404).json({ message: "No exam found for this skill and level" });
      }
      
      // Don't send back the correct answers
      const examQuestions = await storage.getExamQuestionsByExam(exam.id);
      const sanitizedQuestions = examQuestions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        difficultyLevel: q.difficultyLevel,
        points: q.points
      }));
      
      res.json({
        exam: {
          id: exam.id,
          skillName: exam.skillName,
          proficiencyLevel: exam.proficiencyLevel,
          timeLimit: exam.timeLimit,
          passingScore: exam.passingScore
        },
        questions: sanitizedQuestions
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Start an exam (creates an attempt)
  app.post("/api/exams/:examId/start", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      if (isNaN(examId)) {
        return res.status(400).json({ message: "Invalid exam ID" });
      }
      
      const { skillId } = req.body;
      if (!skillId) {
        return res.status(400).json({ message: "Skill ID is required" });
      }
      
      const skillIdNum = parseInt(skillId);
      if (isNaN(skillIdNum)) {
        return res.status(400).json({ message: "Invalid skill ID" });
      }
      
      // Verify the skill belongs to the user
      const skill = await storage.getSkill(skillIdNum);
      if (!skill || skill.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to take an exam for this skill" });
      }
      
      const exam = await storage.getSkillExam(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      // Get random questions for this exam
      const questions = await storage.getRandomExamQuestions(examId, 10); // Get 10 random questions
      if (questions.length === 0) {
        return res.status(404).json({ message: "No questions found for this exam" });
      }
      
      // Calculate max possible score
      const maxScore = questions.reduce((total, q) => total + q.points, 0);
      
      // Create an exam attempt
      const attempt = await storage.createUserExamAttempt({
        userId: req.user!.id,
        examId,
        skillId: skillIdNum,
        maxScore,
        passed: false
      });
      
      // Return sanitized questions (without correct answers)
      const sanitizedQuestions = questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        difficultyLevel: q.difficultyLevel,
        points: q.points
      }));
      
      res.status(201).json({
        attemptId: attempt.id,
        timeLimit: exam.timeLimit,
        maxScore,
        questions: sanitizedQuestions
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Submit exam answers
  app.post("/api/exams/attempts/:attemptId/submit", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const attemptId = parseInt(req.params.attemptId);
      if (isNaN(attemptId)) {
        return res.status(400).json({ message: "Invalid attempt ID" });
      }
      
      const { answers, timeSpentMinutes } = req.body;
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Answers are required" });
      }
      
      // Get the attempt
      const attempt = await storage.getUserExamAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: "Exam attempt not found" });
      }
      
      // Verify the attempt belongs to the user
      if (attempt.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to submit this exam" });
      }
      
      // Get the exam to check passing score
      const exam = await storage.getSkillExam(attempt.examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      // Get all questions for this exam
      const allQuestions = await storage.getExamQuestionsByExam(attempt.examId);
      
      // Create a map of question ID to correct answer for easier lookup
      const questionMap = new Map();
      allQuestions.forEach(q => {
        questionMap.set(q.id, {
          correctAnswer: q.correctAnswer,
          points: q.points,
          explanation: q.explanation
        });
      });
      
      // Calculate score
      let score = 0;
      const gradedAnswers = answers.map((answer: any) => {
        const question = questionMap.get(answer.questionId);
        if (!question) return { ...answer, correct: false, points: 0 };
        
        const isCorrect = answer.answer === question.correctAnswer;
        if (isCorrect) {
          score += question.points;
        }
        
        return {
          ...answer,
          correct: isCorrect,
          points: isCorrect ? question.points : 0,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation
        };
      });
      
      // Check if passed
      const percentScore = (score / attempt.maxScore) * 100;
      const passed = percentScore >= exam.passingScore;
      
      // Update the attempt with results
      const updatedAttempt = await storage.updateUserExamAttempt(attemptId, {
        score,
        passed,
        completedAt: new Date(),
        timeSpentMinutes,
        answers: gradedAnswers
      });
      
      // If passed, create a verification request
      if (passed) {
        await storage.createVerificationRequest({
          userId: req.user!.id,
          skillId: attempt.skillId,
          examAttemptId: attemptId
        });
        
        // Create activity for taking the exam
        await storage.createActivity({
          userId: req.user!.id,
          type: "verification",
          description: `Passed ${exam.skillName} ${exam.proficiencyLevel} exam with ${percentScore.toFixed(1)}%`,
          pointsEarned: 20 // Award points for passing the exam
        });
        
        // Update user points
        const user = await storage.getUser(req.user!.id);
        if (user) {
          await storage.updateUser(user.id, {
            points: user.points + 20
          });
        }
      }
      
      res.json({
        attemptId,
        score,
        maxScore: attempt.maxScore,
        percentScore: percentScore.toFixed(1),
        passed,
        gradedAnswers,
        verificationRequested: passed
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's exam attempts
  app.get("/api/users/me/exam-attempts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const attempts = await storage.getUserExamAttemptsByUser(req.user!.id);
      
      // Get the exams for each attempt
      const attemptsWithExams = await Promise.all(
        attempts.map(async (attempt) => {
          const exam = await storage.getSkillExam(attempt.examId);
          const skill = await storage.getSkill(attempt.skillId);
          
          return {
            ...attempt,
            exam: exam ? {
              id: exam.id,
              skillName: exam.skillName,
              proficiencyLevel: exam.proficiencyLevel,
              passingScore: exam.passingScore
            } : null,
            skill: skill ? {
              id: skill.id,
              name: skill.name,
              proficiencyLevel: skill.proficiencyLevel
            } : null
          };
        })
      );
      
      res.json(attemptsWithExams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's verification requests
  app.get("/api/users/me/verification-requests", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const requests = await storage.getVerificationRequestsByUser(req.user!.id);
      
      // Get the skill for each request
      const requestsWithSkills = await Promise.all(
        requests.map(async (request) => {
          const skill = await storage.getSkill(request.skillId);
          return {
            ...request,
            skill: skill ? {
              id: skill.id,
              name: skill.name,
              proficiencyLevel: skill.proficiencyLevel
            } : null
          };
        })
      );
      
      res.json(requestsWithSkills);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}