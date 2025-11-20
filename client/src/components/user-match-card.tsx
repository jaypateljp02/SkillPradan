import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { SkillTag } from "@/components/ui/skill-tag";
import { Star, User, MessageCircle } from "lucide-react";
import { Link } from "wouter";

interface UserMatchCardProps {
  match: {
    userId: number;
    name: string;
    avatar?: string;
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
    <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <UserAvatar 
            src={match.avatar}
            name={match.name}
            size="md"
          />
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-neutral-900">{match.name}</h4>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-xs text-neutral-500">{match.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-neutral-500">{match.university || 'No university'}</p>
          
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500">Will teach you:</p>
              <div className="mt-1 flex">
                <SkillTag
                  name={match.teachingSkill.name}
                  color="secondary"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Wants to learn:</p>
              <div className="mt-1 flex">
                <SkillTag
                  name={match.learningSkill.name}
                  color="primary"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-500">{match.matchPercentage}% Match</span>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={onRequestExchange}
                disabled={isRequestingExchange}
                className="flex-1"
                data-testid={`button-request-exchange-${match.userId}`}
              >
                Request Exchange
              </Button>
              <Link to={`/messages?user=${match.userId}`}>
                <Button 
                  size="sm" 
                  variant="outline"
                  data-testid={`button-message-${match.userId}`}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
