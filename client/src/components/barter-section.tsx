import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { UserMatchCard } from "./user-match-card";
import { ExchangeCard } from "./exchange-card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function BarterSection(): JSX.Element {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teachingSkillId, setTeachingSkillId] = useState<string>("");
  const [learningSkillId, setLearningSkillId] = useState<string>("");
  const [searchingMatches, setSearchingMatches] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  
  // Get user skills for dropdowns
  const { data: skills = [] } = useQuery<any[]>({
    queryKey: ["/api/skills"],
  });
  
  const teachingSkills = skills.filter((skill: any) => skill.isTeaching);
  const learningSkills = skills.filter((skill: any) => !skill.isTeaching);
  
  // Get active exchanges
  const { data: exchanges = [] } = useQuery<any[]>({
    queryKey: ["/api/exchanges"],
  });
  
  const activeExchanges = exchanges.filter((exchange: any) => 
    exchange.status === "active" || exchange.status === "pending"
  );
  
  // Get skill matches mutation
  const matchMutation = useMutation({
    mutationFn: async (data: { teachingSkillId: number, learningSkillId: number }) => {
      const res = await apiRequest("POST", "/api/skill-matches", data);
      return await res.json();
    },
    onSuccess: () => {
      setSearchingMatches(false);
      setShowMatches(true);
    },
    onError: (error) => {
      setSearchingMatches(false);
      toast({
        title: "Failed to find matches",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle finding matches
  const handleFindMatches = () => {
    if (!teachingSkillId || !learningSkillId) {
      toast({
        title: "Please select skills",
        description: "You need to select both a skill to teach and a skill to learn",
        variant: "destructive",
      });
      return;
    }
    
    setSearchingMatches(true);
    
    // Simulate a short delay for UX purposes
    setTimeout(() => {
      try {
        // Convert to numbers and validate
        const teachingId = Number(teachingSkillId);
        const learningId = Number(learningSkillId);
        
        if (isNaN(teachingId) || isNaN(learningId)) {
          throw new Error("Invalid skill ID format");
        }
        
        matchMutation.mutate({
          teachingSkillId: teachingId,
          learningSkillId: learningId
        });
      } catch (error) {
        setSearchingMatches(false);
        toast({
          title: "Invalid selection",
          description: "Please select valid skills",
          variant: "destructive",
        });
      }
    }, 1500);
  };
  
  // Create exchange mutation
  const createExchangeMutation = useMutation({
    mutationFn: async (data: {
      teacherId: number,
      studentId: number,
      teacherSkillId: number,
      studentSkillId: number
    }) => {
      const res = await apiRequest("POST", "/api/exchanges", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchanges"] });
      toast({
        title: "Exchange requested",
        description: "Your exchange request has been sent",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create exchange",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle requesting an exchange
  const handleRequestExchange = (match: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to request exchanges",
        variant: "destructive",
      });
      return;
    }
    
    // In this scenario:
    // 1. Current user wants to learn matched user's teaching skill
    // 2. Current user wants to teach their selected skill (teachingSkillId)
    // 3. Matched user wants to learn the current user's teaching skill
    try {
      const teachingId = Number(teachingSkillId);
      if (isNaN(teachingId)) {
        throw new Error("Invalid teaching skill ID");
      }
      
      const data = {
        teacherId: user!.id,             // Current user as teacher
        studentId: match.userId,         // Matched user as student
        teacherSkillId: teachingId,      // Current user's teaching skill
        studentSkillId: match.learningSkill.id  // Matched user's learning skill (same as current user's teaching)
      };
      
      createExchangeMutation.mutate(data);
      
      // Also show a toast for better UX
      const teachingSkillName = teachingSkills.find((s: any) => s.id.toString() === teachingSkillId)?.name || 'selected skill';
      toast({
        title: "Requesting exchange...",
        description: `Sending request to ${match.name} to teach them ${teachingSkillName} in exchange for learning ${match.teachingSkill.name}`,
      });
    } catch (error) {
      toast({
        title: "Error creating exchange",
        description: "There was a problem with the skill data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Skill Matching Options */}
      <div className="bg-neutral-50 rounded-lg p-4">
        <h4 className="text-md font-medium text-neutral-900">Find Skill Matches</h4>
        <p className="mt-1 text-sm text-neutral-500">Select the skill you want to teach and what you want to learn</p>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">I can teach:</label>
            <Select onValueChange={(value) => setTeachingSkillId(value)}>
              <SelectTrigger className="mt-1 bg-white text-neutral-900 border-neutral-300">
                <SelectValue placeholder="Select skill" />
              </SelectTrigger>
              <SelectContent>
                {teachingSkills.map((skill: any) => (
                  <SelectItem 
                    key={skill.id} 
                    value={skill.id.toString()}
                    className="text-neutral-900"
                  >
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">I want to learn:</label>
            <Select onValueChange={(value) => setLearningSkillId(value)}>
              <SelectTrigger className="mt-1 bg-white text-neutral-900 border-neutral-300">
                <SelectValue placeholder="Select skill" />
              </SelectTrigger>
              <SelectContent>
                {learningSkills.map((skill: any) => (
                  <SelectItem 
                    key={skill.id} 
                    value={skill.id.toString()}
                    className="text-neutral-900"
                  >
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={handleFindMatches} 
            disabled={searchingMatches || !teachingSkillId || !learningSkillId}
          >
            {searchingMatches ? (
              <>
                Searching <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Find Matches'
            )}
          </Button>
        </div>
      </div>

      {/* Match Results */}
      {showMatches && matchMutation.data && (
        <div className="mt-8">
          <h4 className="text-md font-medium text-neutral-900">Potential Matches</h4>
          <p className="text-sm text-neutral-500">
            We found {matchMutation.data.length || 0} people who match your exchange criteria
          </p>
          
          <div className="mt-4 space-y-4">
            {matchMutation.data.length === 0 ? (
              <div className="bg-neutral-50 p-4 rounded-md text-center">
                <p className="text-sm text-neutral-500">No matches found. Try different skills.</p>
              </div>
            ) : (
              matchMutation.data.map((match: any) => (
                <UserMatchCard 
                  key={match.userId}
                  match={match}
                  onRequestExchange={() => handleRequestExchange(match)}
                  isRequestingExchange={createExchangeMutation.isPending}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Active Exchanges */}
      <div className="mt-8">
        <h4 className="text-md font-medium text-neutral-900">Your Active Exchanges</h4>
        <p className="text-sm text-neutral-500">Ongoing skill exchanges</p>
        
        <div className="mt-4 space-y-4">
          {activeExchanges.length === 0 ? (
            <div className="bg-neutral-50 p-4 rounded-md text-center">
              <p className="text-sm text-neutral-500">No active exchanges found.</p>
            </div>
          ) : (
            activeExchanges.map((exchange: any) => (
              <ExchangeCard 
                key={exchange.id}
                exchange={exchange}
                isCurrentUserTeacher={exchange.teacherId === user!.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
