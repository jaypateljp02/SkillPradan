import { useState, useEffect } from 'react';
import { useQuery, useMutation, QueryFunctionContext } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: number;
  questionText: string;
  questionType: string;
  options: string[];
  difficultyLevel: string;
  points: number;
}

interface ExamStart {
  attemptId: number;
  timeLimit: number;
  maxScore: number;
  questions: Question[];
}

interface ExamResult {
  attemptId: number;
  score: number;
  maxScore: number;
  percentScore: string;
  passed: boolean;
  gradedAnswers: {
    questionId: number;
    answer: string;
    correct: boolean;
    points: number;
    correctAnswer: string;
    explanation: string;
  }[];
  verificationRequested: boolean;
}

interface ExamTakerProps {
  examId: number;
  skillId: number;
  onComplete: () => void;
  onCancel: () => void;
}

export const ExamTaker = ({ examId, skillId, onComplete, onCancel }: ExamTakerProps) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  
  // Start exam
  const { data: examData, isLoading } = useQuery<ExamStart>({
    queryKey: ['/api/exams', examId, 'start'],
    queryFn: async (context: QueryFunctionContext) => {
      const response = await apiRequest(`/api/exams/${examId}/start`, {
        method: 'POST',
        body: JSON.stringify({ skillId })
      });
      const data = await response.json();
      return data;
    },
  });
  
  // Initialize timer when exam starts
  useEffect(() => {
    if (examData && !timeLeft) {
      setTimeLeft(examData.timeLimit * 60); // convert minutes to seconds
    }
  }, [examData, timeLeft]);
  
  // Timer countdown
  useEffect(() => {
    if (!timeLeft) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time is up
          if (!isSubmitting && !examResult) {
            handleSubmit();
          }
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting, examResult]);
  
  // Submit exam answers
  const submitExamMutation = useMutation<
    ExamResult,
    Error,
    { attemptId: number; answers: { questionId: number; answer: string }[]; timeSpentMinutes: number }
  >({
    mutationFn: async (attemptData) => {
      const response = await apiRequest(`/api/exams/attempts/${attemptData.attemptId}/submit`, {
        method: 'POST',
        body: JSON.stringify(attemptData)
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setExamResult(data);
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/exam-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/verification-requests'] });
      
      toast({
        title: data.passed ? 'Exam Passed!' : 'Exam Failed',
        description: data.passed 
          ? `Congratulations! You scored ${data.percentScore}%. A verification request has been submitted.`
          : `You scored ${data.percentScore}%. The passing score was required. Try again later.`,
        variant: data.passed ? 'default' : 'destructive',
      });
    },
    onError: () => {
      setIsSubmitting(false);
      toast({
        title: 'Error',
        description: 'There was a problem submitting your exam. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle question answer
  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  
  // Navigate to next question
  const handleNext = () => {
    if (examData && currentQuestion < examData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };
  
  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  // Submit the exam
  const handleSubmit = () => {
    if (!examData) return;
    
    setIsSubmitting(true);
    
    // Calculate time spent in minutes
    const timeSpentSeconds = (examData.timeLimit * 60) - (timeLeft || 0);
    const timeSpentMinutes = Math.ceil(timeSpentSeconds / 60);
    
    // Format answers for submission
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId),
      answer,
    }));
    
    // Submit the exam
    submitExamMutation.mutate({
      attemptId: examData.attemptId,
      answers: formattedAnswers,
      timeSpentMinutes,
    });
  };
  
  // Handle exam completion
  const handleComplete = () => {
    onComplete();
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading exam questions...</p>
      </div>
    );
  }
  
  // Show exam result
  if (examResult) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Exam Results</h2>
          <Badge variant={examResult.passed ? "success" : "destructive"}>
            {examResult.passed ? "PASSED" : "FAILED"}
          </Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Score: {examResult.score} / {examResult.maxScore} ({examResult.percentScore}%)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={parseFloat(examResult.percentScore)} className="h-2" />
            
            <div className="space-y-6 mt-6">
              <h3 className="text-lg font-medium">Question Review</h3>
              
              {examResult.gradedAnswers.map((answer, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <Badge variant={answer.correct ? "success" : "destructive"}>
                      {answer.correct ? `Correct (+${answer.points})` : "Incorrect (0)"}
                    </Badge>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-muted-foreground/20 space-y-2">
                    <p>Your answer: {answer.answer}</p>
                    {!answer.correct && <p className="text-primary">Correct answer: {answer.correctAnswer}</p>}
                    <p className="text-sm text-muted-foreground">{answer.explanation}</p>
                  </div>
                  
                  <Separator className="my-4" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleComplete}>Return to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Show exam questions
  if (!examData || !examData.questions || examData.questions.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No questions found for this exam. Please try again or contact an administrator.
        </AlertDescription>
      </Alert>
    );
  }
  
  const question = examData.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Take Exam</h2>
        <div className="flex items-center space-x-4">
          <div>
            <span className="font-medium">Time Left: </span>
            <span className={`${timeLeft && timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}`}>
              {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
            </span>
          </div>
          <Badge variant="outline">
            {answeredCount} / {examData.questions.length} Answered
          </Badge>
        </div>
      </div>
      
      <Progress 
        value={(currentQuestion / (examData.questions.length - 1)) * 100}
        className="h-2"
      />
      
      <Card className="mt-4">
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Question {currentQuestion + 1} of {examData.questions.length}</CardTitle>
            <Badge variant="outline">
              {question.difficultyLevel.toUpperCase()} • {question.points} points
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="whitespace-pre-line font-medium">{question.questionText}</p>
            
            <RadioGroup
              value={answers[question.id] || ''}
              onValueChange={(value) => handleAnswer(question.id, value)}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
          </div>
          
          <div className="space-x-2">
            {currentQuestion < examData.questions.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!answers[question.id]}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={answeredCount !== examData.questions.length || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      <div className="flex justify-between mt-4">
        <Button variant="ghost" onClick={onCancel}>Cancel Exam</Button>
        
        <Button
          variant="destructive"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Early'}
        </Button>
      </div>
    </div>
  );
};

export default ExamTaker;