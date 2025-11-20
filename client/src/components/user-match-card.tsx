import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { SkillTag } from "@/components/ui/skill-tag";
import { Card } from "@/components/ui/card";
import { Star, MessageCircle, User } from "lucide-react";
import { Link } from "wouter";

interface UserMatchCardProps {
  match: {
    userId: number;
    name: string;
    avatar?: string;
    username?: string;
    university?: string;
    rating: number;
    teachingSkill: {
      id: number;
      name: string;
    };
    learningSkill: {
      id: number;
      name: string;
    };
    matchPercentage: number;
  };
  onRequestExchange: () => void;
  isRequestingExchange: boolean;
}

export function UserMatchCard({ match, onRequestExchange, isRequestingExchange }: UserMatchCardProps) {
  return (
    <Card className="p-4 hover-elevate">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <UserAvatar 
            src={match.avatar}
            name={match.name}
            size="md"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <h4 className="text-base font-semibold text-foreground truncate">{match.name}</h4>
              <p className="text-sm text-muted-foreground">{match.university || 'No university'}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-foreground">{match.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Will teach you:</p>
              <div className="flex flex-wrap gap-1">
                <SkillTag
                  name={match.teachingSkill.name}
                  color="secondary"
                />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Wants to learn:</p>
              <div className="flex flex-wrap gap-1">
                <SkillTag
                  name={match.learningSkill.name}
                  color="primary"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all" 
                  style={{ width: `${match.matchPercentage}%` }}
                />
              </div>
              <span className="ml-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                {match.matchPercentage}% Match
              </span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                onClick={onRequestExchange}
                disabled={isRequestingExchange}
                className="flex-1 min-w-[120px]"
                data-testid={`button-request-exchange-${match.userId}`}
              >
                {isRequestingExchange ? "Requesting..." : "Request Exchange"}
              </Button>
              <Link to={`/messages?user=${match.userId}`}>
                <Button 
                  size="sm" 
                  variant="outline"
                  data-testid={`button-message-${match.userId}`}
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Message</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
