import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Video, 
  PencilRuler
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

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
      className="w-full"
      onClick={onClick}
    >
      {buttonText}
    </Button>
  );

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
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

export function LearningTools() {
  const { user } = useAuth();
  
  const { data: exchanges = [] } = useQuery({
    queryKey: ["/api/exchanges"],
  });
  
  const activeExchanges = exchanges.filter(exchange => exchange.status === "active");
  
  // Get the first active exchange to link to
  const firstActiveExchange = activeExchanges.length > 0 ? activeExchanges[0] : null;
  const sessionLink = firstActiveExchange ? `/session/${firstActiveExchange.id}` : "";

  return (
    <div className="mt-8">
      <h4 className="text-md font-medium text-neutral-900">Learning Tools</h4>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ToolCard
          icon={
            <div className="h-12 w-12 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center">
              <Video className="text-lg text-primary" />
            </div>
          }
          title="Video Conference"
          description="Connect via video with screen sharing"
          buttonText="Start a Session"
          href={sessionLink || undefined}
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
          href={sessionLink || undefined}
        />
      </div>
    </div>
  );
}
