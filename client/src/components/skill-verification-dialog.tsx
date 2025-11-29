import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Award, Check, X, Loader2, Trophy, Star, Medal } from "lucide-react";

interface SkillQuestion {
    question: string;
    type: "multiple-choice" | "short-answer";
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
}

interface Assessment {
    skillName: string;
    questions: SkillQuestion[];
    difficulty: "beginner" | "intermediate" | "advanced" | "expert";
}

interface AssessmentResult {
    score: number;
    totalQuestions: number;
    percentage: number;
    badgeLevel: "beginner" | "intermediate" | "advanced" | "expert" | null;
    feedback: string;
}

interface SkillVerificationDialogProps {
    skillId: number;
    skillName: string;
    open: boolean;
    onClose: () => void;
}

const BADGE_ICONS = {
    beginner: { icon: Award, color: "text-amber-600", bg: "bg-amber-100", label: "🥉 Beginner" },
    intermediate: { icon: Medal, color: "text-gray-500", bg: "bg-gray-100", label: "🥈 Intermediate" },
    advanced: { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-100", label: "🥇 Advanced" },
    expert: { icon: Star, color: "text-purple-600", bg: "bg-purple-100", label: "💎 Expert" }
};

export function SkillVerificationDialog({ skillId, skillName, open, onClose }: SkillVerificationDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [stage, setStage] = useState<"select" | "testing" | "results">("select");
    const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | "expert">("intermediate");
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [result, setResult] = useState<AssessmentResult | null>(null);

    const generateMutation = useMutation({
        mutationFn: async (selectedDifficulty: string) => {
            const res = await apiRequest("POST", `/api/skills/${skillId}/generate-assessment`, {
                difficulty: selectedDifficulty
            });
            return res.json();
        },
        onSuccess: (data) => {
            setAssessment(data);
            setUserAnswers(new Array(data.questions.length).fill(""));
            setStage("testing");
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to generate assessment. Please try again.",
                variant: "destructive"
            });
        }
    });

    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/skills/${skillId}/submit-assessment`, {
                questions: assessment?.questions,
                userAnswers,
                difficulty: assessment?.difficulty
            });
            return res.json();
        },
        onSuccess: (data) => {
            setResult(data.result);
            setStage("results");
            queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
            queryClient.invalidateQueries({ queryKey: [`/api/users/${skillId}/skill-badges`] });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to submit assessment. Please try again.",
                variant: "destructive"
            });
        }
    });

    const handleStartTest = () => {
        generateMutation.mutate(difficulty);
    };

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[index] = value;
        setUserAnswers(newAnswers);
    };

    const handleSubmit = () => {
        const allAnswered = userAnswers.every(answer => answer.trim() !== "");
        if (!allAnswered) {
            toast({
                title: "Incomplete",
                description: "Please answer all questions before submitting.",
                variant: "destructive"
            });
            return;
        }
        submitMutation.mutate();
    };

    const handleClose = () => {
        setStage("select");
        setAssessment(null);
        setUserAnswers([]);
        setResult(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                {stage === "select" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Verify Your Skill: {skillName}</DialogTitle>
                            <DialogDescription>
                                Take an AI-generated test to verify your proficiency and earn a badge!
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            <div>
                                <h3 className="font-semibold mb-3">Select Difficulty Level:</h3>
                                <RadioGroup value={difficulty} onValueChange={(val) => setDifficulty(val as any)}>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(BADGE_ICONS).map(([level, data]) => (
                                            <div key={level} className="flex items-center space-x-2">
                                                <RadioGroupItem value={level} id={level} />
                                                <Label
                                                    htmlFor={level}
                                                    className="flex items-center gap-2 cursor-pointer px-4 py-3 rounded-lg border hover:bg-neutral-50 flex-1"
                                                >
                                                    <span>{data.label}</span>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2">📝 Test Details:</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• 5 questions total</li>
                                    <li>• Multiple choice and short answer formats</li>
                                    <li>• AI-powered grading</li>
                                    <li>• Earn badges: 41-60% Beginner, 61-80% Intermediate, 81-90% Advanced, 91-100% Expert</li>
                                    <li>• Minimum 41% required to earn a badge</li>
                                </ul>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button
                                onClick={handleStartTest}
                                disabled={generateMutation.isPending}
                                className="bg-gradient-to-r from-primary to-purple-600 text-white"
                            >
                                {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Start Test
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {stage === "testing" && assessment && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{skillName} Assessment</DialogTitle>
                            <DialogDescription>
                                Answer all {assessment.questions.length} questions to the best of your ability
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {assessment.questions.map((question, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
                                    <h3 className="font-semibold mb-3">
                                        Question {index + 1} of {assessment.questions.length}
                                    </h3>
                                    <p className="mb-4 text-neutral-700">{question.question}</p>

                                    {question.type === "multiple-choice" && question.options && (
                                        <RadioGroup
                                            value={userAnswers[index]}
                                            onValueChange={(val) => handleAnswerChange(index, val)}
                                        >
                                            <div className="space-y-2">
                                                {question.options.map((option, optIndex) => (
                                                    <div key={optIndex} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} />
                                                        <Label
                                                            htmlFor={`q${index}-opt${optIndex}`}
                                                            className="cursor-pointer px-3 py-2 rounded border hover:bg-neutral-50 flex-1"
                                                        >
                                                            {option}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    )}

                                    {question.type === "short-answer" && (
                                        <Textarea
                                            value={userAnswers[index]}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                            placeholder="Type your answer here..."
                                            rows={3}
                                            className="w-full"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitMutation.isPending}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                            >
                                {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Answers
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {stage === "results" && result && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-center">Assessment Results</DialogTitle>
                        </DialogHeader>

                        <div className="py-6 space-y-6 text-center">
                            <div className="flex justify-center">
                                {result.badgeLevel ? (
                                    <div className={`p-8 rounded-full ${BADGE_ICONS[result.badgeLevel].bg}`}>
                                        {result.badgeLevel === "beginner" && <Award className={`h-24 w-24 ${BADGE_ICONS[result.badgeLevel].color}`} />}
                                        {result.badgeLevel === "intermediate" && <Medal className={`h-24 w-24 ${BADGE_ICONS[result.badgeLevel].color}`} />}
                                        {result.badgeLevel === "advanced" && <Trophy className={`h-24 w-24 ${BADGE_ICONS[result.badgeLevel].color}`} />}
                                        {result.badgeLevel === "expert" && <Star className={`h-24 w-24 ${BADGE_ICONS[result.badgeLevel].color}`} />}
                                    </div>
                                ) : (
                                    <div className="p-8 rounded-full bg-neutral-100">
                                        <X className="h-24 w-24 text-neutral-500" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-3xl font-bold mb-2">{result.percentage}%</h3>
                                <p className="text-neutral-600">
                                    {result.score} out of {result.totalQuestions} correct
                                </p>
                            </div>

                            {result.badgeLevel ? (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
                                    <h4 className="text-xl font-bold text-green-900 mb-2">
                                        🎉 Congratulations!
                                    </h4>
                                    <p className="text-green-800 mb-2">
                                        You've earned the <strong>{BADGE_ICONS[result.badgeLevel].label}</strong> badge!
                                    </p>
                                    <p className="text-sm text-green-700">{result.feedback}</p>
                                </div>
                            ) : (
                                <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
                                    <h4 className="text-xl font-bold text-amber-900 mb-2">Keep Practicing!</h4>
                                    <p className="text-amber-800">{result.feedback}</p>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full bg-primary">
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
