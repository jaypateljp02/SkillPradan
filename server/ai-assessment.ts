import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface SkillQuestion {
    question: string;
    type: "multiple-choice" | "short-answer" | "code";
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
}

export interface SkillAssessment {
    skillName: string;
    questions: SkillQuestion[];
    difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  // Indicates whether questions came from Gemini or from the local fallback
  source: "gemini" | "fallback";
}

export interface AssessmentResult {
    score: number;
    totalQuestions: number;
    percentage: number;
    badgeLevel: "beginner" | "intermediate" | "advanced" | "expert" | null;
    feedback: string;
}

/**
 * Generate skill assessment questions using Gemini AI
 */
export async function generateSkillAssessment(
    skillName: string,
    difficulty: "beginner" | "intermediate" | "advanced" | "expert" = "intermediate"
): Promise<SkillAssessment> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate a skill assessment test for "${skillName}" at ${difficulty} level.
  
Requirements:
- Create exactly 5 questions
- Mix of question types: 3 multiple-choice and 2 short-answer questions
- Questions should test practical knowledge and application
- For multiple-choice: provide 4 options with one correct answer
- Include brief explanations for correct answers
- Difficulty appropriate for ${difficulty} level

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "question": "question text",
      "type": "multiple-choice",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct option text",
      "explanation": "why this is correct"
    },
    {
      "question": "question text",
      "type": "short-answer",
      "correctAnswer": "brief expected answer",
      "explanation": "evaluation criteria"
    }
  ]
}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Log a short preview so we can see if Gemini responded at all
        console.log("Gemini assessment raw response (first 200 chars):", text.slice(0, 200));

        // Clean the response to extract JSON
        let jsonText = text.trim();
        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\s*/g, "").replace(/```\s*/g, "");

        let data: any;
        try {
            data = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON, falling back to local questions:", parseError);
            // Explicitly fall back if parsing fails
            return getFallbackAssessment(skillName, difficulty);
        }

        if (!data?.questions || !Array.isArray(data.questions)) {
            console.error("Gemini response missing questions array, falling back to local questions");
            return getFallbackAssessment(skillName, difficulty);
        }

        return {
            skillName,
            questions: data.questions,
            difficulty,
            source: "gemini",
        };
    } catch (error) {
        console.error("Error calling Gemini for assessment, using fallback instead:", error);
        // Fallback questions if AI call fails
        return getFallbackAssessment(skillName, difficulty);
    }
}

/**
 * Grade a user's assessment using Gemini AI
 */
export async function gradeAssessment(
    questions: SkillQuestion[],
    userAnswers: string[]
): Promise<AssessmentResult> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let correctCount = 0;
    const totalQuestions = questions.length;

    // Grade multiple-choice questions automatically
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswer = userAnswers[i];

        if (question.type === "multiple-choice") {
            if (userAnswer?.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase()) {
                correctCount++;
            }
        }
    }

    // Grade short-answer questions using AI
    const shortAnswerQuestions = questions
        .map((q, i) => ({ question: q, answer: userAnswers[i], index: i }))
        .filter(item => item.question.type === "short-answer");

    if (shortAnswerQuestions.length > 0) {
        const gradingPrompt = `Grade these short-answer responses. For each answer, respond with just "correct" or "incorrect".

${shortAnswerQuestions.map((item, idx) => `
Question ${idx + 1}: ${item.question.question}
Expected: ${item.question.correctAnswer}
User's answer: ${item.answer}
`).join('\n')}

Return ONLY a JSON array of results (no markdown):
["correct" or "incorrect", ...]`;

        try {
            const result = await model.generateContent(gradingPrompt);
            const response = await result.response;
            let text = response.text().trim();

            // Clean markdown
            text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

            const grades = JSON.parse(text);
            grades.forEach((grade: string) => {
                if (grade.toLowerCase().includes("correct")) {
                    correctCount++;
                }
            });
        } catch (error) {
            console.error("Error grading short answers:", error);
            // Give partial credit if AI grading fails
            correctCount += Math.floor(shortAnswerQuestions.length / 2);
        }
    }

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const badgeLevel = getBadgeLevel(percentage);

    return {
        score: correctCount,
        totalQuestions,
        percentage,
        badgeLevel,
        feedback: getFeedback(percentage, badgeLevel)
    };
}

/**
 * Determine badge level based on percentage score
 */
function getBadgeLevel(percentage: number): "beginner" | "intermediate" | "advanced" | "expert" | null {
    if (percentage < 41) return null;
    if (percentage >= 41 && percentage <= 60) return "beginner";
    if (percentage >= 61 && percentage <= 80) return "intermediate";
    if (percentage >= 81 && percentage <= 90) return "advanced";
    return "expert"; // 91-100
}

/**
 * Generate feedback message based on score
 */
function getFeedback(percentage: number, badgeLevel: string | null): string {
    if (percentage < 41) {
        return "Keep practicing! You need a score of at least 41% to earn a badge. Review the material and try again.";
    }
    if (badgeLevel === "beginner") {
        return "Great start! You've earned a Beginner badge. Keep learning to advance to the next level.";
    }
    if (badgeLevel === "intermediate") {
        return "Well done! You've demonstrated solid intermediate knowledge. Keep pushing for advanced mastery!";
    }
    if (badgeLevel === "advanced") {
        return "Excellent work! You're at an advanced level. Just a bit more to reach expert status!";
    }
    return "Outstanding! You've achieved expert-level mastery of this skill. Congratulations!";
}

/**
 * Fallback questions if AI generation fails
 */
function getFallbackAssessment(skillName: string, difficulty: string): SkillAssessment {
    console.log("⚠️ Using local fallback questions instead of Gemini output");
    return {
        skillName,
        difficulty: difficulty as any,
        source: "fallback",
        questions: [
            {
                question: `What is a fundamental concept in ${skillName}?`,
                type: "multiple-choice",
                options: [
                    "Basic understanding",
                    "Advanced techniques",
                    "Expert optimization",
                    "None of the above"
                ],
                correctAnswer: "Basic understanding",
                explanation: "Fundamental concepts form the foundation."
            },
            {
                question: `Describe a practical application of ${skillName}.`,
                type: "short-answer",
                correctAnswer: "Any relevant practical application",
                explanation: "Should demonstrate understanding of real-world use cases."
            },
            {
                question: `What are best practices when working with ${skillName}?`,
                type: "short-answer",
                correctAnswer: "Following industry standards and conventions",
                explanation: "Should show awareness of professional standards."
            },
            {
                question: `How would you explain ${skillName} to a beginner?`,
                type: "multiple-choice",
                options: [
                    "Use simple terms and examples",
                    "Use technical jargon",
                    "Avoid explanations",
                    "Only show code"
                ],
                correctAnswer: "Use simple terms and examples",
                explanation: "Effective teaching uses clear, accessible language."
            },
            {
                question: `What resources would you recommend for learning ${skillName}?`,
                type: "short-answer",
                correctAnswer: "Official documentation, tutorials, and practice projects",
                explanation: "Good resources include official docs and hands-on practice."
            }
        ]
    };
}
