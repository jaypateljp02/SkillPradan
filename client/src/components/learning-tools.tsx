import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Video,
  PencilRuler,
  Code
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  href?: string;
  onClick?: () => void;
}

function ToolCard({ icon, title, description, buttonText, href, onClick }: ToolCardProps) {
  const button = (
    <Button
      className="w-full bg-purple text-white hover:bg-opacity-90"
      onClick={onClick}
    >
      {buttonText}
    </Button>
  );

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-4">
          <h5 className="text-md font-medium text-neutral-900">{title}</h5>
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="mt-4">
        {href ? (
          <Link href={href}>
            {button}
          </Link>
        ) : (
          button
        )}
      </div>
    </div>
  );
}

interface Exchange {
  id: number;
  status: string;
  teacherId: number;
  studentId: number;
  teacherSkillId: number;
  studentSkillId: number;
  createdAt: string;
  totalSessions: number;
  sessionsCompleted: number;
}

export function LearningTools() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: exchanges = [] } = useQuery<Exchange[]>({
    queryKey: ["/api/exchanges"],
  });

  const activeExchanges = exchanges.filter((exchange) => exchange.status === "active");

  // Get the first active exchange to link to
  const firstActiveExchange = activeExchanges.length > 0 ? activeExchanges[0] : null;
  // const sessionLink = firstActiveExchange ? `/session/${firstActiveExchange.id}` : "";

  const handleComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `The ${feature} feature is currently in development.`,
    });
  };

  return (
    <div className="mt-8">
      <h4 className="text-md font-medium text-neutral-900">Learning Tools</h4>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <ToolCard
          icon={
            <div className="h-12 w-12 rounded-lg bg-purple-light flex items-center justify-center">
              <Video className="text-lg text-purple" />
            </div>
          }
          title="Video Conference"
          description="Connect via video with screen sharing"
          buttonText="Start a Session"
          onClick={() => handleComingSoon("Video Conference")}
        />

        <ToolCard
          icon={
            <div className="h-12 w-12 rounded-lg bg-emerald-500 bg-opacity-10 flex items-center justify-center">
              <PencilRuler className="text-lg text-emerald-500" />
            </div>
          }
          title="Interactive Whiteboard"
          description="Collaborate on a shared canvas"
          buttonText="Open Whiteboard"
          onClick={() => handleComingSoon("Interactive Whiteboard")}
        />

        <ToolCard
          icon={
            <div className="h-12 w-12 rounded-lg bg-blue-500 bg-opacity-10 flex items-center justify-center">
              <Code className="text-lg text-blue-500" />
            </div>
          }
          title="Live Coding"
          description="Real-time collaborative code editor"
          buttonText="Start Coding"
          onClick={() => handleComingSoon("Live Coding")}
        />
      </div>
    </div>
  );
}
