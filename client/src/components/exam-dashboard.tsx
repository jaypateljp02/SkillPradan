import { useState, useEffect } from 'react';
import { useQuery, useMutation, QueryFunctionContext } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface Skill {
  id: number;
  name: string;
  proficiencyLevel: string;
  isVerified: boolean;
  isTeaching: boolean;
}

interface Exam {
  id: number;
  skillName: string;
  proficiencyLevel: string;
  timeLimit: number;
  passingScore: number;
}

interface Question {
  id: number;
  questionText: string;
  questionType: string;
  options: string[];
  difficultyLevel: string;
  points: number;
}

interface ExamView {
  exam: Exam;
  questions: Question[];
}

interface ExamAttempt {
  id: number;
  examId: number;
  skillId: number;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  maxScore: number;
  passed: boolean;
  exam?: {
    id: number;
    skillName: string;
    proficiencyLevel: string;
  };
  skill?: {
    id: number;
    name: string;
    proficiencyLevel: string;
  };
}

interface VerificationRequest {
  id: number;
  skillId: number;
  status: string;
  requestedAt: string;
  skill?: {
    id: number;
    name: string;
    proficiencyLevel: string;
  };
}

export const ExamDashboard = () => {
  const { toast } = useToast();
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [activeTab, setActiveTab] = useState('available');

  // Get user's skills
  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: ['/api/skills'],
  });

  // Get user's exam attempts
  const { data: examAttempts = [] } = useQuery<ExamAttempt[]>({
    queryKey: ['/api/users/me/exam-attempts'],
  });

  // Get user's verification requests
  const { data: verificationRequests = [] } = useQuery<VerificationRequest[]>({
    queryKey: ['/api/users/me/verification-requests'],
  });

  // Get available exams for a skill
  const { data: examData, refetch: refetchExams } = useQuery<ExamView | null>({
    queryKey: ['/api/skills', currentSkill?.id, 'exams'],
    queryFn: async (context: QueryFunctionContext) => {
      if (!currentSkill) return null;
      const response = await apiRequest(`/api/skills/${currentSkill.id}/exams?level=${currentSkill.proficiencyLevel}`);
      if (!response) return null;
      const data = await response.json();
      return data as ExamView;
    },
    enabled: !!currentSkill,
  });

  // Start an exam
  const startExamMutation = useMutation({
    mutationFn: async (skillId: number) => {
      if (!examData?.exam?.id) return null;
      const response = await apiRequest(`/api/exams/${examData.exam.id}/start`, {
        method: 'POST',
        body: JSON.stringify({ skillId })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/exam-attempts'] });
      toast({
        title: 'Exam Started',
        description: 'You can now take the exam. Good luck!',
        variant: 'default',
      });
    }
  });

  // Select a skill to view its exams
  const handleSelectSkill = (skill: Skill) => {
    if (skill.isTeaching) {
      toast({
        title: 'Not Available',
        description: 'Exams are only available for skills you want to learn, not skills you teach.',
        variant: 'destructive',
      });
      return;
    }
    
    if (skill.isVerified) {
      toast({
        title: 'Already Verified',
        description: 'This skill is already verified.',
        variant: 'default',
      });
      return;
    }
    
    setCurrentSkill(skill);
    refetchExams();
  };

  // Start an exam for a skill
  const handleStartExam = () => {
    if (!currentSkill) return;
    startExamMutation.mutate(currentSkill.id);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Skill Verification Exams</h2>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Skills</h3>
          {skills?.length === 0 && (
            <Alert>
              <AlertTitle>No skills found</AlertTitle>
              <AlertDescription>
                Add skills you want to learn to see available exams.
              </AlertDescription>
            </Alert>
          )}
          
          {skills?.filter(skill => !skill.isTeaching).map((skill) => (
            <Card 
              key={skill.id} 
              className={`cursor-pointer ${currentSkill?.id === skill.id ? 'border-primary' : ''}`}
              onClick={() => handleSelectSkill(skill)}
            >
              <CardHeader className="py-4">
                <CardTitle className="text-md font-semibold flex justify-between">
                  {skill.name}
                  {skill.isVerified && <Badge variant="default">Verified</Badge>}
                </CardTitle>
                <CardDescription>
                  Level: {skill.proficiencyLevel}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">Available Exams</TabsTrigger>
              <TabsTrigger value="attempts">Your Attempts</TabsTrigger>
              <TabsTrigger value="requests">Verification Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available" className="space-y-4 pt-4">
              {!currentSkill && (
                <Alert>
                  <AlertTitle>No skill selected</AlertTitle>
                  <AlertDescription>
                    Select a skill from the list to see available exams.
                  </AlertDescription>
                </Alert>
              )}
              
              {currentSkill && !examData && (
                <Alert>
                  <AlertTitle>Loading exams...</AlertTitle>
                  <AlertDescription>
                    Please wait while we load the exams for this skill.
                  </AlertDescription>
                </Alert>
              )}
              
              {currentSkill && examData && (
                <Card>
                  <CardHeader>
                    <CardTitle>{examData.exam.skillName} - {examData.exam.proficiencyLevel} Level Exam</CardTitle>
                    <CardDescription>
                      This exam contains {examData.questions.length} questions. 
                      You have {examData.exam.timeLimit} minutes to complete it.
                      Passing score: {examData.exam.passingScore}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium">Sample Questions:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        {examData.questions.slice(0, 2).map((question, index) => (
                          <li key={index}>{question.questionText}</li>
                        ))}
                        {examData.questions.length > 2 && <li>...and {examData.questions.length - 2} more questions</li>}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleStartExam}
                      disabled={startExamMutation.isPending}
                    >
                      {startExamMutation.isPending ? 'Starting...' : 'Start Exam'}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="attempts" className="space-y-4 pt-4">
              {!examAttempts || examAttempts.length === 0 ? (
                <Alert>
                  <AlertTitle>No exam attempts</AlertTitle>
                  <AlertDescription>
                    You haven't taken any exams yet. Select a skill and start an exam.
                  </AlertDescription>
                </Alert>
              ) : (
                examAttempts.map((attempt) => (
                  <Card key={attempt.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between">
                        {attempt.skill?.name} - {attempt.exam?.proficiencyLevel} Level
                        <Badge variant={attempt.passed ? "success" : "destructive"}>
                          {attempt.passed ? "Passed" : "Failed"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Taken on {new Date(attempt.startedAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {attempt.completedAt ? (
                        <div className="space-y-2">
                          <p>Score: {attempt.score} / {attempt.maxScore} ({Math.round((attempt.score || 0) / attempt.maxScore * 100)}%)</p>
                          <p>Status: {attempt.passed ? 'Passed' : 'Failed'}</p>
                        </div>
                      ) : (
                        <p>This exam is still in progress.</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="requests" className="space-y-4 pt-4">
              {!verificationRequests || verificationRequests.length === 0 ? (
                <Alert>
                  <AlertTitle>No verification requests</AlertTitle>
                  <AlertDescription>
                    You haven't submitted any verification requests yet. Pass an exam to request verification.
                  </AlertDescription>
                </Alert>
              ) : (
                verificationRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between">
                        {request.skill?.name} - {request.skill?.proficiencyLevel} Level
                        <Badge variant={
                          request.status === 'approved' ? 'success' : 
                          request.status === 'rejected' ? 'destructive' : 
                          'default'
                        }>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Submitted on {new Date(request.requestedAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ExamDashboard;